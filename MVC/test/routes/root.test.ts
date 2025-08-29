import { build } from "../helper";

const app = build();

describe("Root tests", () => {
  it("Base root available", async () => {
    const res = await app.inject({
      url: "/",
      method: "GET",
    });
    expect(res.statusCode).toEqual(200);
  })
});
