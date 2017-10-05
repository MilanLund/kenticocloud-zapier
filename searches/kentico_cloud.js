<<<<<<< HEAD
=======
/*
 * The core code file for the Kentico Cloud - Zapier connector
 * Milan Lund, 2017
 * */


 // Processes data obtained from webhook and requests Kentico Cloud for content item
const getElement = (z, bundle) => {

  // Input from Zapier UI
  var projectId = bundle.inputData.projectId, // Kentico Cloud Project ID
      contentType = bundle.inputData.contentType.trim(), // Content type codename that should be watched for changes 
      payloadOperation = bundle.inputData.payloadOperation.trim(), // Operation on content item obtained from webhook
      payloadDataItems = transformDataItems(bundle.inputData.payloadDataItems); // Information about updated content item from webhook

  // Request Kentico Cloud endpoint assembled from obtained data
  const getItem = z.request('https://deliver.kenticocloud.com/' + projectId + '/items?system.type=' + contentType + '&system.codename=' + searchItem(payloadDataItems, 'codename'), {
      params: {
        projectId: projectId,
        contentType: contentType,
        payloadOperation: payloadOperation
      }
  });

  // Make the request in case content item gets published and is wanted content type
  if ((payloadOperation === 'publish') && (contentType === searchItem(payloadDataItems, 'type'))) {
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


// Helper method that transforms information about updated content item from string to multidimensional array so we can search it with use of the searchItem method
const transformDataItems = (data) => {
  var arr = [];
  data = data.replace(/(?:\r\n|\r|\n)/g, ',').replace(/\s/g,'');
  
  arr = data.split(',');

  arr.forEach((item, index) => {
    arr[index] = arr[index].split(':');
  });

  return arr;
};


// Helper method that searches for a value in array obratined from the transformDataItems method
const searchItem = (arr, itemName) => {
  var returnValue = '';

  arr.forEach((value, index) => {
    if (arr[index][0] === itemName) {
      returnValue = arr[index][1];
    }
  });

  return returnValue;
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
      {key: 'projectId', label: 'Project ID (Static value)', type: 'string', required: true},
      {key: 'contentType', label: 'Content type codename (Static value)', type: 'string', required: true},
      {key: 'payloadOperation', label: 'Message Operation (Catch Hook value)', type: 'string', required: true},
      {key: 'payloadDataItems', label: 'Data Items (Catch Hook value)', type: 'string', required: true}
    ],
    perform: getElement
  }
};
>>>>>>> 70408905ee3a4c847e5bcde2523c53e796a2a453
