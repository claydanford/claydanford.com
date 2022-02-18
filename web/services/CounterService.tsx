
import { API, graphqlOperation } from 'aws-amplify'

export const updateCount = async () => {
  const query = `mutation MyMutation {
    updateCount {
      count
    }
  }`

  const { data } = (await API.graphql(graphqlOperation(query))) as {
    data: any
  }

  return data.updateCount.count
}