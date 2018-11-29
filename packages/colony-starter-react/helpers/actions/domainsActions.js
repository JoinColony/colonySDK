// import big number
import BN from 'bn.js'

// addDomain

export const addDomain = async (colonyClient) => {

  // add domain
  const addDomainResponse = await colonyClient.addDomain.send({
    parentSkillId: 1,
  })

  // get domain id
  const { count: domainId } = await colonyClient.getDomainCount.call()

  // get domain
  const domain = getDomain(colonyClient, domainId)

  // return domain
  return domain

}

// fundDomain

export const fundDomain = async (colonyClient, domainId, amount) => {

  // set token
  const token = colonyClient.token._contract.address

  // get domain
  const { potId } = await colonyClient.getDomain.call({ domainId })

  // move funds between pots
  await colonyClient.moveFundsBetweenPots.send({
    fromPot: 1,
    toPot: potId,
    amount: new BN(amount),
    token,
  })

  // return true
  return true

}

// getDomain

export const getDomain = async (colonyClient, domainId) => {

  // get domain
  const domain = await colonyClient.getDomain.call({ domainId })

  // return domain
  return domain

}

// getDomains

export const getDomains = async (colonyClient) => {

  // get domain count
  const { count: domainCount} = await colonyClient.getDomainCount.call()

  // set domain id
  let domainId = 1

  // set domains
  let domains = []

  // get domains
  while (domainId <= domainCount) {

    // get domain
    let domain = await getDomain(colonyClient, domainId)

    // append domain id
    domain.id = domainId

    // push domain to domains
    domains.push(domain)

    // increment domain id
    domainId++

  }

  // return domains
  return domains

}