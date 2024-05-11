import { isEqual, partition, sortBy } from 'lodash-es';
import { type RuleDesc, type TypeDesc } from '../../3-describe/types';
import { type DiscriminateCondition } from './types';

// TODO: better naming
// TODO: less loops

export class IdentiqueTypes extends Error {
  constructor(
    message: string,
    public typeIndexes: number[]
  ) {
    super(message);
  }
}

type DiscriminationTreeNode = {
  condition: DiscriminateCondition;
  matches: { typeIndex: number }[];
  next: DiscriminationTreeNode | null;
};

const mapTypeDiscriminateBranches = (
  type: TypeDesc,
  typeIndex: number
): DiscriminationTreeNode[] => {
  switch (type.type) {
    case 'chevrotainToken':
      return [
        {
          condition: {
            type: 'isToken',
            tokenName: type.tokenName,
          },
          matches: [{ typeIndex }],
          next: null,
        },
      ];
    case 'object': {
      return [
        ...Object.keys(type.fields).map(
          (fieldName): DiscriminationTreeNode => ({
            condition: {
              type: 'hasField',
              fieldName,
            },
            matches: [{ typeIndex }],
            next: {
              condition: {
                type: 'fieldOfType',
                fieldName,
                value: type.fields[fieldName],
              },
              matches: [{ typeIndex }],
              next: null,
            },
          })
        ),
      ];
    }
    default:
  }
  throw new Error(`Unknown type ${type.type}`);
};

type Expression =
  | {
      type: 'resolve';
      value: {
        typeIndex: number;
      };
    }
  | {
      type: 'ternary';
      condition: DiscriminateCondition;
      then: Expression;
      else: Expression | null;
    };

const mapDiscriminationExprCost = (
  ternaryExpr: Expression | undefined | null
): number => {
  if (!ternaryExpr) {
    return 0;
  }
  if (ternaryExpr.type === 'resolve') {
    return 0;
  }

  switch (ternaryExpr.condition.type) {
    case 'isToken':
    case 'fieldOfType':
    case 'hasField': {
      return (
        1 +
        mapDiscriminationExprCost(ternaryExpr.then) +
        mapDiscriminationExprCost(ternaryExpr.else)
      );
    }
    default:
  }
  throw new Error(
    `Unknown condition type ${JSON.stringify(ternaryExpr.condition)}`
  );
};

const mapDiscriminationNode = ({
  currentNode,
  currentCheck,
  currentNodeRestChecks,
  restNodes,
}: {
  currentNode: {
    typeIndex: number;
    checks: DiscriminationTreeNode[];
  };
  currentCheck: DiscriminationTreeNode;
  currentNodeRestChecks: DiscriminationTreeNode[];
  restNodes: {
    typeIndex: number;
    checks: DiscriminationTreeNode[];
  }[];
}): Expression => {
  if (!restNodes.length) {
    return {
      type: 'resolve',
      value: {
        typeIndex: currentNode.typeIndex,
      },
    };
  }
  const res = restNodes.map((node) => {
    const [conflictings, notConflictings] = partition(
      node.checks,
      (otherCheck) => isEqual(otherCheck.condition, currentCheck.condition)
    );
    if (conflictings.length > 1) {
      throw new Error(
        `Unexpected type ${node.typeIndex} has multiple conflicting check with ${JSON.stringify(currentCheck.condition)}`
      );
    }

    return {
      conflictingCheck: conflictings[0],
      notConflictingChecks: notConflictings,
      node,
    };
  });

  const [withConflicts, withoutConflicts] = partition(
    res,
    (r) => !!r.conflictingCheck
  );

  const elseCase = mapDiscriminationTree(withoutConflicts.map((r) => r.node));

  if (!withConflicts.length) {
    return {
      type: 'ternary',
      condition: currentCheck.condition,
      then: {
        type: 'resolve',
        value: { typeIndex: currentNode.typeIndex },
      },
      else: elseCase,
    };
  }

  if (currentCheck.next) {
    // next check should be to check current check next step
    const then = mapDiscriminationNode({
      currentNode,
      currentCheck: currentCheck.next,
      currentNodeRestChecks,
      restNodes: withConflicts.map((r) => {
        return {
          typeIndex: r.node.typeIndex,
          checks: [r.conflictingCheck.next!, ...r.notConflictingChecks],
        };
      }),
    });
    if (!then) {
      throw new IdentiqueTypes('Types are identiques', [
        currentNode.typeIndex,
        ...restNodes.map((n) => n.typeIndex),
      ]);
    }

    if (!withoutConflicts.length) {
      // if there are no else case, we can directly do then case
      return then;
    }

    return {
      type: 'ternary',
      condition: currentCheck.condition,
      then,
      else: elseCase,
    };
  }

  // next check should be to check other checks of the current node
  const then = mapDiscriminationItem({
    node: {
      typeIndex: currentNode.typeIndex,
      checks: currentNodeRestChecks,
    },
    otherNodes: withConflicts.map((r) => {
      return {
        typeIndex: r.node.typeIndex,
        checks: r.notConflictingChecks,
      };
    }),
  });

  if (!then) {
    throw new IdentiqueTypes('Types are identiques', [
      currentNode.typeIndex,
      ...restNodes.map((n) => n.typeIndex),
    ]);
  }

  if (!withoutConflicts.length) {
    return then;
  }

  return {
    type: 'ternary',
    condition: currentCheck.condition,
    then,
    else: elseCase,
  };
};

const mapDiscriminationItem = ({
  node,
  otherNodes,
}: {
  node: {
    typeIndex: number;
    checks: DiscriminationTreeNode[];
  };
  otherNodes: {
    typeIndex: number;
    checks: DiscriminationTreeNode[];
  }[];
}) => {
  const res = node.checks.map((check) => {
    const restChecks = node.checks.filter((otherCheck) => otherCheck !== check);

    const tree = mapDiscriminationNode({
      currentNode: node,
      currentCheck: check,
      currentNodeRestChecks: restChecks,
      restNodes: otherNodes,
    });
    return {
      tree,
      cost: mapDiscriminationExprCost(tree),
    };
  });
  const sorted = sortBy(res, 'cost');
  return sorted[0]?.tree;
};

const mapDiscriminationTree = (
  nodes: {
    typeIndex: number;
    checks: DiscriminationTreeNode[];
  }[]
) => {
  const res = nodes.map((node) => {
    const otherNodes = nodes.filter((other) => other !== node);
    const tree = mapDiscriminationItem({ node, otherNodes });
    return {
      tree,
      cost: mapDiscriminationExprCost(tree),
    };
  });

  const sorted = sortBy(res, 'cost');
  return sorted[0]?.tree;
};

export const discriminateType = ({
  possibleTypes,
  ruleDescs,
}: {
  possibleTypes: TypeDesc[];
  ruleDescs: Record<string, RuleDesc>;
}) => {
  const typeNodes = possibleTypes.map((type, index) => {
    const actualType =
      type.type === 'ruleRef'
        ? ruleDescs[type.ruleName].body.parseOutputType
        : type;
    const nodes = mapTypeDiscriminateBranches(actualType, index);

    return {
      typeIndex: index,
      checks: nodes,
    };
  });

  const ternaryExpr = mapDiscriminationTree(typeNodes);
  if (ternaryExpr === undefined) {
    throw new IdentiqueTypes(
      'All types are identique',
      typeNodes.map((n) => n.typeIndex)
    );
  }
  return ternaryExpr;
};
