// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { UserInstitutionLinkApiOut, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import React, { useCallback } from "react";
import {
  PlaidLinkOnEvent,
  PlaidLinkOnEventMetadata,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkStableEvent,
  usePlaidLink,
} from "react-plaid-link";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import { logMutationError } from "utils/error";

export default function PlaidLinkButton(props: {
  onSuccess: () => void;
  institutionLink?: UserInstitutionLinkApiOut;
}) {
  const linkTokenQuery =
    api.endpoints.getLinkTokenApiUsersMeInstitutionLinksLinkTokenGet.useQuery(
      props.institutionLink?.id || 0,
    );

  async function handleOnSuccess(
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata,
  ) {
    if (!metadata.institution) {
      console.error("Same-Day micro-deposit verifications are not supported!");
      return;
    }
    if (!props.institutionLink) {
      try {
        await setPublicToken({
          publicToken,
          institutionPlaidId: metadata.institution.institution_id,
        }).unwrap();
      } catch (error) {
        logMutationError(error, setPublicTokenResult);
        return;
      }
    }
    props.onSuccess();
  }

  const handleEvent = useCallback<PlaidLinkOnEvent>(
    (
      eventName: PlaidLinkStableEvent | string,
      metadata: PlaidLinkOnEventMetadata,
    ) => {
      console.log(eventName, metadata);
    },
    [],
  );

  const plaidLink = usePlaidLink({
    token: linkTokenQuery.data || null,
    onSuccess: handleOnSuccess,
    onEvent: handleEvent,
  });

  const [setPublicToken, setPublicTokenResult] =
    api.endpoints.setPublicTokenApiUsersMeInstitutionLinksPublicTokenPost.useMutation();

  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="university" />
        {props.institutionLink
          ? "Re-connect with your Financial Institution"
          : "Connect with your Financial Institution"}
      </Header>
      <Button
        onClick={() => plaidLink.open()}
        disabled={!plaidLink.ready}
        negative={plaidLink.error !== null}
        positive
        circular
      >
        Launch
      </Button>
      <QueryErrorMessage query={linkTokenQuery} />
      <QueryErrorMessage query={setPublicTokenResult} />
    </Segment>
  );
}
