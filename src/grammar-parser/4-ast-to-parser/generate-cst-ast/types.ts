import { type TypeDesc } from '../../3-describe/types';

// export type DiscriminateChain = {
//   nodes: DiscriminateChainNode[];
// };
export type DiscriminateNode = {
  condition: DiscriminateCondition;
  branches: DiscriminateNode[];
  matching: any[];
};

type Discriminate = {
  condition: DiscriminateChain;
  composable: DiscriminateChain[];
};

export type DiscriminateChainNode = {
  condition: DiscriminateCondition;
  matching: any[];
};

export type DiscriminateCondition =
  | DiscriminatorIsToken
  | DiscriminateHasField
  | DiscriminateFieldType;
// | DiscriminateDefault;

export type DiscriminatorIsToken = {
  type: 'isToken';
  tokenName: string;
};

export type DiscriminateHasField = {
  type: 'hasField';
  fieldName: string;
};
export type DiscriminateFieldType = {
  type: 'fieldOfType';
  fieldName: string;
  value: TypeDesc;
};

export type DiscriminateDefault = {
  type: 'default';
};
