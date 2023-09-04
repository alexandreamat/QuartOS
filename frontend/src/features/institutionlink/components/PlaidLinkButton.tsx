import { UserInstitutionLinkApiOut, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import React from "react";
import { PlaidLinkOnSuccessMetadata, usePlaidLink } from "react-plaid-link";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import { logMutationError } from "utils/error";

export default function PlaidLinkButton(props: {
  onSuccess: () => void;
  institutionLink?: UserInstitutionLinkApiOut;
}) {
  const linkTokenQuery =
    api.endpoints.getLinkTokenApiUsersMeInstitutionLinksLinkTokenGet.useQuery(
      props.institutionLink?.id || 0
    );

  async function handleOnSuccess(
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata
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

  const plaidLink = usePlaidLink({
    token: linkTokenQuery.data || null,
    onSuccess: handleOnSuccess,
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
