import { Application, helpers, Router } from "https://deno.land/x/oak/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const env:{ [index: string]: string } = 
  Deno.env.get("environment") === "production" ? Deno.env.toObject() : config();

interface main {
  temp: number
  temp_min: number
  temp_max: number
}

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .get("/city/:city", async (context) => {
    if (context.params && context.params.city) {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${context.params.city}&appid=${env.APPID}&units=imperial`)
      const temp:main = (await response.json())['main'];
      context.response.body = temp;
    }
  })
  .get("/delta", async (context) => {
    const query: Record<string, string> = helpers.getQuery(
      context,
      { mergeParams: true },
    );
    if ("cities" in query) {
      console.log(query.cities)
      const [city1, city2] = query.cities.split(",");

      const city1Response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city1}&appid=${env.APPID}&units=imperial`)
      const city1Temp:main = (await city1Response.json())['main'];

      const city2Response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city2}&appid=${env.APPID}&units=imperial`)
      const city2Temp:main = (await city2Response.json())['main'];

      console.log(city1Temp)
      console.log(city2Temp)
      if (!city1Temp || !city2Temp) {
        context.response.body = "Cities are not valid";        
      } else {
        const response = {
          temp: Math.abs(city1Temp.temp - city2Temp.temp),
          temp_min: Math.abs(city1Temp.temp_min - city2Temp.temp_min),
          temp_max: Math.abs(city1Temp.temp_max - city2Temp.temp_max)
        }
        context.response.body = response;
      }
        
      

    }
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
