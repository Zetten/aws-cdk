import * as cxschema from '@aws-cdk/cloud-assembly-schema';
import * as cxapi from '@aws-cdk/cx-api';
import { Mode, SdkProvider } from '../api';
import { ContextProviderPlugin } from '../api/plugin';
import { debug } from '../logging';

export class EksClusterContextProviderPlugin implements ContextProviderPlugin {
  constructor(private readonly aws: SdkProvider) {
  }

  async getValue(args: cxschema.EksClusterContextQuery): Promise<cxapi.EksClusterContextResponse> {
    const account: string = args.account!;
    const region: string = args.region!;

    const options = { assumeRoleArn: args.lookupRoleArn };
    const eks = (await this.aws.forEnvironment(cxapi.EnvironmentUtils.make(account, region), Mode.ForReading, options)).sdk.eks();

    let describeClusterResponse = await eks.describeCluster({ name: args.eksClusterName }).promise();

    if (describeClusterResponse.cluster) {
      debug(`EKS cluster found ${describeClusterResponse.cluster.arn}`);
      return {
        clusterName: describeClusterResponse.cluster.name!,
      };
    } else {
      throw new Error(`Could not find any EKS cluster with name ${args.eksClusterName}`);
    }
  }
}
