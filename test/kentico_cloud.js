/**
 * Tests for the Kentico Cloud - Zapier connector
 * Milan Lund, 2017
 */

const should = require('should'); // Required to use .exist()
const util= require('util'); // Helps to see full output in terminal
const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);
const testObject = '{ \
    "message": { \
        "id": "29e0dcc1-2ff2-4732-a4a6-68cabf2727e1", \
        "type": "content_item_variant", \
        "operation": "publish", \
        "api_name": "delivery_production", \
        "project_id": "6f9dc707-3579-418e-98d4-c26f6d760005" \
    }, \
    "data": { \
        "items": [ \
            { \
                "language": "default", \
                "codename": "never_delete_this", \
                "type": "facebook_post" \
            } \
        ], \
        "taxonomies": [] \
    } \
}';

describe('searches', () => {
    describe('search Kentico Cloud', () => {

        /** 
         * Tests the typesField method
         */
        it('should get content types', (done) => {
            const bundle = {
                inputData: {
                    projectId: '6f9dc707-3579-418e-98d4-c26f6d760005',
                    contentType: 'facebook_post',
                    payload: testObject
                }
            };

            appTester(App.searches.kentico_cloud.operation.inputFields[2], bundle)
                .then(results => {
                    console.log(util.inspect(results, {showHidden: false, depth: null}));

                    results.length.should.be.equal(1);
                    const item = results[0];
                    should.exist(item.choices);
                    item.key.should.eql('contentType');

                    done();
                })
                .catch(done);
        });

        /** 
         * Tests the getElement method
         */
        it('should find a content item', (done) => {
            const bundle = {
                inputData: {
                    projectId: '6f9dc707-3579-418e-98d4-c26f6d760005',
                    contentType: 'facebook_post',
                    payload: testObject
                }
            };

            appTester(App.searches.kentico_cloud.operation.perform, bundle)
                .then(results => {
                    console.log(util.inspect(results, {showHidden: false, depth: null}));

                    results.length.should.be.equal(1);  
                    const item = results[0];
                    item.system.name.should.eql('Never delete this');
                    should.exist(item.system.name);
                    should.exist(item.elements.text);

                    done();
                })
                .catch(done);
        });
    });
});