import { UserInstitutionLinkApiOut, api } from "app/services/api";
import { QueryErrorMessage } from "components/QueryErrorMessage";
import React from "react";
import { PlaidLink, PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { Header, Icon, Loader, Segment } from "semantic-ui-react";
import { logMutationError } from "utils/error";

export default function PlaidLinkButton(props: {
  onSuccess: () => void;
  institutionLink?: UserInstitutionLinkApiOut;
}) {
  const linkTokenQuery =
    api.endpoints.getLinkTokenApiUsersMeInstitutionLinksLinkTokenGet.useQuery(
      props.institutionLink?.id || 0
    );
  const [setPublicToken, setPublicTokenResult] =
    api.endpoints.setPublicTokenApiUsersMeInstitutionLinksPublicTokenPost.useMutation();

  const handleOnSuccess = async (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata
  ) => {
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
  };

  return (
    <Segment placeholder>
      {(linkTokenQuery.isLoading || setPublicTokenResult.isLoading) && (
        <Loader active />
      )}
      {linkTokenQuery.isSuccess && setPublicTokenResult.isUninitialized && (
        <>
          <Header icon>
            <Icon name="university" />
            {props.institutionLink
              ? "Re-connect with your Financial Institution"
              : "Connect with your Financial Institution"}
          </Header>
          <PlaidLink
            clientName="QuartOS"
            env="development"
            token={linkTokenQuery.data}
            product={["auth", "transactions"]}
            onSuccess={handleOnSuccess}
          >
            Launch
          </PlaidLink>
        </>
      )}
      <QueryErrorMessage query={linkTokenQuery} />
      <QueryErrorMessage query={setPublicTokenResult} />
    </Segment>
  );
}
