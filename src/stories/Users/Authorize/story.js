/**
 1. If issuer is user and there is no  `X-Team-Identifier` 
    1. User is Authorised
    2. The assumption is that the product which called `/authorize` is not using teams
 2. If issuer is user and there is  `X-Team-Identifier`
    1. Check if current "sub" is member of above team, If not, 401
    2. If yes, get the permissions object for that member from [Team Members](https://www.notion.so/Authorization-78551392a2f74de0bc39bd4b32906cdc) table
    3. If team member, has role, get the permissions from roles table
 3. If issuer is team
    1. Get the permissions object for that token from tokens table using jti
 */

const TeamsRepo = requireRepo("teams");
// const RolesRepo = requireRepo("roles");
const TokensRepo = requireRepo("tokens");
const TeamMembersRepo = requireRepo("teamMembers");

const prepare = ({ req }) => {
  let payload = {
    jti: req.jti,
    sub: req.sub,
    issuer: req.issuer,
  };

  payload["team_uuid"] = req.headers["x-team-identifier"];

  return payload;
};

const authorize = ({ prepareResult }) => {
  return true;
};

const handle = async ({ prepareResult }) => {
  console.log("prepareResult", prepareResult);

  let unauthorizedObject = {
    statusCode: 401,
    message: "Unauthorized",
  };

  try {
    // If issuer is user and there is  `X-Team-Identifier`
    if (
      prepareResult["team_uuid"] !== undefined &&
      prepareResult.issuer === "user"
    ) {
      let teamMember = await TeamMembersRepo.first({
        team_uuid: prepareResult.team_uuid,
        user_uuid: prepareResult.sub,
      });

      if (teamMember !== undefined) {
        if (teamMember.role !== null) {
          let role = await RolesRepo.first({ uuid: teamMember.role });
          return role.permissions;
        }
        return teamMember.permissions;
      }
    }

    // If issuer is user and there is no  `X-Team-Identifier`
    if (
      prepareResult.issuer === "user" &&
      prepareResult["team_uuid"] === undefined
    ) {
      return {};
    }

    if (prepareResult.issuer === "team") {
      let team = await TeamsRepo.first({ uuid: prepareResult.sub });

      if (team !== undefined) {
        return await TokensRepo.first({ uuid: prepareResult.jti }).permissions;
      }
    }

    throw unauthorizedObject;
  } catch (error) {
    throw error;
  }
};

const respond = ({ handleResult }) => {
  return handleResult;
};

module.exports = {
  prepare,
  authorize,
  handle,
  respond,
};
