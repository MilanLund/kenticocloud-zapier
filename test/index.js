const should = require('should');

const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('My App', () => {

  it('should load Kentico Cloud project', (done) => {
    const triggerPointer = 'triggers.kenticocloud';
    const bundle = {
      // NEW CODE
      inputData: {
        projectId: '6f9dc707-3579-418e-98d4-c26f6d760005'
      }
    };

    appTester(App.triggers.kenticocloud.operation.perform, bundle)
      .then(results => {
        should(results.length).above(0);

        const firstResult = results[0].system;
        console.log('test result: ', firstResult)
        should(firstResult.name).eql('Facebook post');

        done();
      })
      .catch(done);
  });

});