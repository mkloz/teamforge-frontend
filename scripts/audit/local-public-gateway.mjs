// @ts-check

import { createServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import net from "node:net";
import tls from "node:tls";
import {
  isPublicSocketPath,
  translateGatewayPath,
} from "./gateway-acceptance-contract.mjs";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "proxy-connection",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

/**
 * Starts a loopback-only reverse proxy that models the public path translation
 * without aliases. The caller owns lifecycle and must close it.
 *
 * @param {object} options Gateway options.
 * @param {number} [options.port] Loopback port; zero requests an ephemeral port.
 * @param {string} options.upstreamOrigin Exact canary origin.
 */
export async function startLocalPublicGateway({ port = 0, upstreamOrigin }) {
  const upstream = new URL(upstreamOrigin);
  const activeSockets = new Set();
  const server = createServer((request, response) => {
    proxyHttpRequest({ request, response, upstream });
  });

  server.on("connection", (socket) => {
    activeSockets.add(socket);
    socket.on("close", () => activeSockets.delete(socket));
  });
  server.on("upgrade", (request, socket, head) => {
    proxyUpgrade({ head, request, socket, upstream });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(undefined);
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Loopback gateway did not expose a TCP address.");
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    async close() {
      for (const socket of activeSockets) socket.destroy();
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
    },
  };
}

function proxyHttpRequest({ request, response, upstream }) {
  const sourceUrl = new URL(request.url ?? "/", "http://gateway.invalid");
  const translatedPath = translateGatewayPath(sourceUrl.pathname);

  if (!translatedPath) {
    sendFailClosed(response);
    return;
  }

  const targetPath = `${translatedPath}${sourceUrl.search}`;
  const requestFactory =
    upstream.protocol === "https:" ? httpsRequest : httpRequest;
  const upstreamRequest = requestFactory(
    upstream,
    {
      headers: createForwardHeaders(request.headers, upstream),
      method: request.method,
      path: targetPath,
    },
    (upstreamResponse) => {
      response.writeHead(
        upstreamResponse.statusCode ?? 502,
        copyResponseHeaders(upstreamResponse.headers),
      );
      upstreamResponse.pipe(response);
    },
  );

  upstreamRequest.on("error", () => {
    if (!response.headersSent) response.writeHead(502);
    response.end();
  });
  request.pipe(upstreamRequest);
}

function proxyUpgrade({ head, request, socket, upstream }) {
  const sourceUrl = new URL(request.url ?? "/", "http://gateway.invalid");
  const translatedPath = translateGatewayPath(sourceUrl.pathname);

  if (!translatedPath || !isPublicSocketPath(sourceUrl.pathname)) {
    rejectUpgrade(socket, 404);
    return;
  }

  const upstreamPort = Number(
    upstream.port || (upstream.protocol === "https:" ? 443 : 80),
  );
  const connectOptions = {
    host: upstream.hostname,
    port: upstreamPort,
  };
  const upstreamSocket =
    upstream.protocol === "https:"
      ? tls.connect({ ...connectOptions, servername: upstream.hostname })
      : net.connect(connectOptions);

  upstreamSocket.once(
    upstream.protocol === "https:" ? "secureConnect" : "connect",
    () => {
      const headers = createForwardHeaders(request.headers, upstream);
      headers.connection = "Upgrade";
      headers.upgrade = "websocket";
      const requestLines = [
        `${request.method ?? "GET"} ${translatedPath}${sourceUrl.search} HTTP/1.1`,
        ...Object.entries(headers).map(([name, value]) => `${name}: ${value}`),
        "",
        "",
      ];
      upstreamSocket.write(requestLines.join("\r\n"));
      if (head.length > 0) upstreamSocket.write(head);
      socket.pipe(upstreamSocket).pipe(socket);
    },
  );

  upstreamSocket.on("error", () => {
    if (!socket.destroyed) rejectUpgrade(socket, 502);
  });
  socket.on("error", () => upstreamSocket.destroy());
}

function createForwardHeaders(headers, upstream) {
  const forwarded = {};
  for (const [name, value] of Object.entries(headers)) {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && value !== undefined) {
      forwarded[name] = value;
    }
  }
  forwarded.host = upstream.host;
  forwarded["x-forwarded-for"] = "127.0.0.1";
  forwarded["x-forwarded-proto"] = "https";
  return forwarded;
}

function copyResponseHeaders(headers) {
  const copied = {};
  for (const [name, value] of Object.entries(headers)) {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && value !== undefined) {
      copied[name] = value;
    }
  }
  return copied;
}

function sendFailClosed(response) {
  response.writeHead(404, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end('{"statusCode":404,"message":"Not Found"}');
}

function rejectUpgrade(socket, status) {
  if (socket.destroyed) return;
  socket.end(`HTTP/1.1 ${status} Rejected\r\nConnection: close\r\n\r\n`);
}
