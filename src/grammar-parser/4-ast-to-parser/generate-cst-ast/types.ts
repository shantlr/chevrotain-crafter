import { type TypeDesc } from '../../3-describe/types';

export type DiscriminateCondition =
  | DiscriminatorIsToken
  | DiscriminateHasField
  | DiscriminateFieldType;

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
