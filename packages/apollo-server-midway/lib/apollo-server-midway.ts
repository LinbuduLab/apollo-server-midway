import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
import { parseAll } from '@hapi/accept';
import { LandingPage } from 'apollo-server-plugin-base';

import { graphqlCoreHandler } from './handler';

import {
  MidwaySLSReqRes,
  CreateHandlerOption,
  MidwayReq,
  MidwayRes,
} from './types';

export class ApolloServerMidway extends ApolloServerBase {
  async createGraphQLServerOptions(
    req: MidwayReq,
    res: MidwayRes
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res });
  }

  public async createHandler({
    path,
    context: { request: req, response: res },
  }: CreateHandlerOption) {
    this.assertStarted('createHandler');

    this.graphqlPath = path || '/graphql';

    const landingPage = this.getLandingPage();

    if (
      landingPage &&
      this.handleGraphqlRequestsWithLandingPage({ req, res, landingPage })
    ) {
      return;
    }
    if (await this.handleGraphqlRequestsWithServer({ req, res })) {
      return;
    }
  }

  private getURLLastPart(url: string): string {
    const urlFragments = url.split('/');
    const lastFragment = urlFragments[urlFragments.length - 1];
    return `/${lastFragment}`;
  }

  private handleGraphqlRequestsWithLandingPage({
    req,
    res,
    landingPage,
  }: MidwaySLSReqRes & {
    landingPage: LandingPage;
  }): boolean {
    let handled = false;

    const url = this.getURLLastPart(req.url);
    if (req.method === 'GET' && url === this.graphqlPath) {
      const accept = parseAll(req.headers);
      const types = accept.mediaTypes as string[];
      const prefersHtml =
        types.find(
          (x: string) => x === 'text/html' || x === 'application/json'
        ) === 'text/html';

      if (prefersHtml) {
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.body = landingPage.html;
        handled = true;
      }
    }

    return handled;
  }

  private async handleGraphqlRequestsWithServer({
    req,
    res,
  }: MidwaySLSReqRes): Promise<boolean> {
    let handled = false;
    const url = this.getURLLastPart(req.url);
    if (url === this.graphqlPath) {
      const graphqlHandler = graphqlCoreHandler(() => {
        return this.createGraphQLServerOptions(req, res);
      });
      await graphqlHandler(req, res);
      handled = true;
    }
    return handled;
  }
}
