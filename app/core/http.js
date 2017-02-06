import app from "../app";
import { defaultsDeep } from "lodash";

export const json = (url, opts = {}) => fetch(
  url,
  defaultsDeep(
    {
      credentials: "include",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json"
      }
    },
    opts
  )
)
  // .then(console.log.bind(console))
  .then(res => res.ok ? res.json() : { error: res.statusText });

export const login = body => json(app.host + "/_session", {
  method: "POST",
  body: JSON.stringify(body)
});
