import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_wvnq8nm9oFZ0EBlHH1aRion8F1uhyOVSIl6sy2hbuNF';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let initialized = false;

export const initPostHog = () => {
  if (initialized) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  });
  initialized = true;
};

export const identifyUser = (name: string) => {
  posthog.identify(name, { display_name: name });
};

export const trackEvent = (event: string, properties?: Record<string, any>) => {
  posthog.capture(event, properties);
};

export { posthog };
