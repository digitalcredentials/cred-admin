export type PublicKey = {
  id: string;
  type: "JsonWebKey2020";
  controller: string;
  publicKeyJwk: {
    kid: string;
    kty: string;
    crv: string;
    x: string;
  };
  privateKeyJwk: {
    kid: string;
    kty: string;
    crv: string;
    x: string;
    d: string;
  };
};

export type DIDDocument = {
  "@context": string;
  id: string;
  publicKey: Array<PublicKey>;
  authentication: Array<string>;
  assertionMethod: Array<string>;
  capabilityDelegation: Array<string>;
  capabilityInvocation: Array<string>;
};
