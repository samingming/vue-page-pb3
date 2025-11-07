import { exampleBuilds } from './creational/builder'
import { exampleFacadeFlow } from './structural/facade'
import { exampleStrategyFlow } from './behavioral/strategy'

async function run() {
  console.log('Builder:', exampleBuilds())
  console.log('Strategy:', exampleStrategyFlow())
  console.log('Facade:', await exampleFacadeFlow())
}

run()
