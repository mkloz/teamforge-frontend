export function getGreeting(firstName: string): {
  greeting: string;
  sub: string;
} {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      greeting: `Good morning, ${firstName}`,
      sub: "What needs a tap before the day gets busy.",
    };
  }

  if (hour < 17) {
    return {
      greeting: `Good afternoon, ${firstName}`,
      sub: "Plans first, fresh openings after.",
    };
  }

  return {
    greeting: `Good evening, ${firstName}`,
    sub: "A quick look before the night gets away.",
  };
}
