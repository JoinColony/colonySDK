import { Record, Static, String } from 'runtypes';
import fetch from 'cross-fetch';
import wrapFetch from 'fetch-retry';

const fetchRetry = wrapFetch(fetch);

const IPFS_METADATA = {
  DomainMetadata: Record({
    domainName: String,
    domainColor: String,
    domainPurpose: String,
  }),
};

const CLOUDFLARE_IPFS_ENDPOINT = 'https://cloudflare-ipfs.com/ipfs/';

export interface IpfsOptions {
  endpoint: string;
}

export class IpfsMetadata {
  private ipfsEndpoint: string;

  constructor(options?: IpfsOptions) {
    this.ipfsEndpoint = options?.endpoint || CLOUDFLARE_IPFS_ENDPOINT;
  }

  async getMetadataForEvent<T extends keyof typeof IPFS_METADATA>(
    eventName: T,
    ipfsCid: string,
  ): Promise<Static<typeof IPFS_METADATA[T]>> {
    const res = await fetchRetry(`${this.ipfsEndpoint}${ipfsCid}`, {
      headers: {
        Accept: 'application/json',
      },
      retryOn: [404, 503],
      retries: 3,
      retryDelay: 5000,
    });
    try {
      const data = await res.json();
      return IPFS_METADATA[eventName].check(data);
    } catch (e) {
      throw new Error(
        `Could not parse IPFS metadata. Original error: ${
          (e as Error).message
        }`,
      );
    }
  }
}
