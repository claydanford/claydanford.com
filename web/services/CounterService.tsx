import { API, graphqlOperation } from 'aws-amplify'

export const updateCount = async () => {
  const mutation = `mutation MyMutation {
    updateCount {
      count
    }
  }`

  const res: any = await API.graphql(graphqlOperation(mutation))

  return res.data.updateCount.count
}
