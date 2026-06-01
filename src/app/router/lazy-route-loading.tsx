import {
  type ComponentType,
  type LazyExoticComponent,
  lazy,
  Suspense,
} from "react";

import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import { RouteLoadingFallback } from "@/shared/components/loading/route-loading-fallback";

type PageLoadingModule<Props extends PageLoadingProps> = {
  default: ComponentType<Props>;
};

export function createLazyRouteLoading<
  Props extends PageLoadingProps = PageLoadingProps,
>(load: () => Promise<PageLoadingModule<Props>>, props: Props) {
  const Loading = lazy(load);

  return function LazyRouteLoading() {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <LazyLoadingComponent component={Loading} props={props} />
      </Suspense>
    );
  };
}

function LazyLoadingComponent<Props extends PageLoadingProps>({
  component: Component,
  props,
}: {
  component: LazyExoticComponent<ComponentType<Props>>;
  props: Props;
}) {
  return <Component {...props} />;
}
