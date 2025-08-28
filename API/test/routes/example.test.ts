import { build } from "../helper";

const app = build();

describe("Example test", () => {
  it("Example is loaded", async () => {
    const res = await app.inject({
      url: "/v1/ping",
    });
    expect(res.statusCode).toEqual(200);
  });
});