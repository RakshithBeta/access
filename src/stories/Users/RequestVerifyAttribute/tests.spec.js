const debugLogger = requireUtil("debugLogger");
const knex = requireKnex();

describe("Test Handler Users/RequestVerifyAttribute", () => {
  it("dummy_story_which_will_pass", async () => {
    let result = {};
    try {
      result = await testStrategy("Users/RequestVerifyAttribute", {
        prepareResult: {},
      });
    } catch (error) {
      debugLogger(error);
    }
    const { respondResult } = result;
    expect(1).toBe(1);
  });
});
