import { api } from "app/services/api";
import React from "react";
import { PlaidLink, PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import {
  Dimmer,
  Header,
  Icon,
  Loader,
  Message,
  Segment,
} from "semantic-ui-react";
import { renderErrorMessage } from "utils/error";

export default function PlaidLinkButton(props: { onSuccess: () => void }) {
  const linkTokenQuery =
    api.endpoints.getLinkTokenApiPlaidLinkTokenGet.useQuery();
  const [setPublicToken, setPublicTokenResult] =
    api.endpoints.setPublicTokenApiPlaidPublicTokenPost.useMutation();

  const handleOnSuccess = async (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata
  ) => {
    if (!metadata.institution) {
      console.error("Same-Day micro-deposit verifications are not supported!");
      return;
    }
    try {
      await setPublicToken({
        publicToken,
        institutionPlaidId: metadata.institution.institution_id,
      }).unwrap();
    } catch (error) {
      console.error(error);
      console.error(linkTokenQuery.error);
      return;
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
            Connect with your Financial Institution
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
      {linkTokenQuery.isError && (
        <Message negative>{renderErrorMessage(linkTokenQuery.error)}</Message>
      )}
      {setPublicTokenResult.isError && (
        <Message negative>
          {renderErrorMessage(setPublicTokenResult.error)}
        </Message>
      )}
    </Segment>
  );
}
