import app from "./../../app";
import { json } from "../http";

export function get() {
  return json(app.host + "/_session");
}

export function create(body) {
  return json(app.host + "/_session", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function remove() {
  return json(app.host + "/_session", {
    method: "DELETE",
    body: JSON.stringify({ username: "_", password: "_" })
  });
}
