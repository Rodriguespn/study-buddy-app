import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { NextFunction, Request, Response } from "express";
import type { McpServer } from "skybridge/server";

import {
  type AuthContext,
  authStorage,
  extractBearerToken,
  getWWWAuthenticateHeader,
  validateToken,
} from "./auth.js";

export const mcp =
  (server: McpServer) => async (req: Request, res: Response, next: NextFunction) => {
    // Only handle requests to the /mcp path
    if (req.path !== "/mcp") {
      return next();
    }

    if (req.method === "POST") {
      // Validate OAuth token
      const token = extractBearerToken(req.headers.authorization);

      if (!token) {
        res
          .status(401)
          .set("WWW-Authenticate", getWWWAuthenticateHeader())
          .json({
            jsonrpc: "2.0",
            error: {
              code: -32001,
              message: "Authentication required",
            },
            id: null,
          });
        return;
      }

      let authContext: AuthContext;
      try {
        authContext = await validateToken(token);
      } catch (error) {
        const isExpired = error instanceof Error && error.message.includes("exp");
        res
          .status(401)
          .set(
            "WWW-Authenticate",
            getWWWAuthenticateHeader("invalid_token", isExpired ? "Token expired" : "Invalid token")
          )
          .json({
            jsonrpc: "2.0",
            error: {
              code: -32001,
              message: isExpired ? "Token expired" : "Invalid token",
            },
            id: null,
          });
        return;
      }

      // Wrap MCP handling in auth context so handlers can access the authenticated user
      await authStorage.run(authContext, async () => {
        try {
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
          });

          res.on("close", () => {
            transport.close();
          });

          await server.connect(transport);

          await transport.handleRequest(req, res, req.body);
        } catch (error) {
          console.error("Error handling MCP request:", error);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: "2.0",
              error: {
                code: -32603,
                message: "Internal server error",
              },
              id: null,
            });
          }
        }
      });
    } else if (req.method === "GET" || req.method === "DELETE") {
      res.writeHead(405).end(
        JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Method not allowed.",
          },
          id: null,
        })
      );
    } else {
      next();
    }
  };
