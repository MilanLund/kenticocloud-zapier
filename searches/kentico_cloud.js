/*
 * The core doce file for the Kentico Cloud - Zapier connector
 * Milan Lund, 2017
 * */


 // Processes data obtained from webhook and requests Kentico Cloud for content item
 const getElement = (z, bundle) => {
  // Input from Zapier UI
  var payload = JSON.parse(bundle.inputData.payload);
      projectId = bundle.inputData.projectId, // Kentico Cloud Project ID
      contentType = bundle.inputData.contentType.trim(), // Content type codename that should be watched for changes 
      payloadOperation = payload.message.operation, // Operation on content item obtained from webhook
      payloadDataItems = payload.data.items[0]; // Information about updated content item from webhook
  
    // Request to Kentico Cloud endpoint assembled from obtained data
    const getItem = z.request('https://deliver.kenticocloud.com/' + projectId + '/items?system.type=' + contentType + '&system.codename=' + payloadDataItems.codename, {
        params: {
          projectId: projectId,
          contentType: contentType,
          payloadOperation: payloadOperation
        }
    });
  
    // Make the request in case content item gets published and is wanted content type
    if ((payloadOperation === 'publish') && (contentType == payloadDataItems.type)) {
      return getItem.then((response) => {
        var items = JSON.parse(response.content).items;
        return makePropertiesAccessible(items, payloadDataItems);
      });
    } else {
      return []; // In Zapier Task History the operation becomes halted
    }
  };
  
  
  // Helper method that fulfills Zapier's requirement to have id as a top-level property of obtained objects
  const makePropertiesAccessible = (items, payloadDataItems) => {
    items.forEach((value, index) => {
      items[index]['id'] = index;
    });
  
    return items;
  };

  // Dynamic field that gets content types based on projectId
  const typesField = (z, bundle) => {
      var choices = {};

      if (bundle.inputData.projectId && bundle.inputData.projectId !== '') {
          const getTypes = z.request('https://deliver.kenticocloud.com/' + bundle.inputData.projectId + '/types');

          return getTypes.then((response) => {
              var items = JSON.parse(response.content).types;

              items.forEach((value, index) => {
                  choices[items[index].system.codename] = items[index].system.name;
              });

              return [{key: 'contentType', label: 'Content type name (Static value)', required: true, choices: choices}];    
          });
      }

      return [{key: 'contentType', label: 'Content type name (Static value)', required: true, choices: choices}];     
    };
  

  // Zapier object for it's internal needs
  module.exports = {
    key: 'kentico_cloud',
    noun: 'Kentico Cloud',
  
    display: {
      label: 'Kentico Cloud Content',
      description: 'Retrieve content items from Kentico Cloud storage.'
    },
  
    operation: {
      inputFields: [
          {key: 'payload', label: 'Payload data (Raw Body value)', type: 'string', required: true},
          {key: 'projectId', label: 'Project ID (Static value)', type: 'string', required: true, altersDynamicFields: true},
          typesField 
      ],
      perform: getElement
    }
  };