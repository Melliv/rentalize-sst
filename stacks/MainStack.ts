import { Api, StackContext, StaticSite } from "sst/constructs";

export function MainStack({ stack }: StackContext) {

  const api = new Api(stack, "Api", {
    routes: {
      "GET /api/location": "packages/functions/src/api/location/getLocation.main",
      "POST /api/location": "packages/functions/src/api/location/saveLocation.main",
      "POST /api/details": "packages/functions/src/api/details/saveDetails.main",
      "GET /api/job/save-location": "packages/functions/src/job/saveLocation.main",
      "GET /api/job/details/save-all-providers-cars-details": "packages/functions/src/job/details/saveAllProvidersCarsDetails.main",
      "GET /api/job/details/save-bolt-cars-details": "packages/functions/src/job/details/saveBoltCarsDetails.main",
      "GET /api/job/details/save-citybee-cars-details": "packages/functions/src/job/details/saveCityBeeCarsDetails.main",
      "GET /api/job/details/save-beast-cars-details": "packages/functions/src/job/details/saveBeastCarsDetails.main",
      "GET /api/job/details/save-elmo-cars-details": "packages/functions/src/job/details/saveElmoCarsDetails.main",
    },
  });

  const site = new StaticSite(stack, "RentalizeSite", {
    path: process.env.RENTALIZE_FRONTEND_URL,
    buildCommand: "vite build",
    buildOutput: "build",
    environment: {
      BACKEND_API_URL: api.url + "/api/",
    },
  });

  stack.addOutputs({
    SiteUrl: site.url,
    ApiEndpoint: api.url,
  });
}
