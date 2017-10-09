/**
 * The core code file for the Kentico Cloud - Zapier connector
 * Milan Lund, 2017
 */

/**
 * Processes data obtained from webhook and requests Kentico Cloud for content item
 */
 const getElement = (z, bundle) => {
  // Input from Zapier UI
  var payload = JSON.parse(bundle.inputData.payload); // Parse payload 
      projectId = bundle.inputData.projectId, // Kentico Cloud Project ID
      contentType = bundle.inputData.contentType.trim(), // Content type codename that should be watched for changes 
      payloadOperation = payload.message.operation, // Operation on content item obtained from webhook
      payloadDataItems = payload.data.items[0]; // Information about updated content item from webhook
  
  // Request to Kentico Cloud endpoint assembled from obtained data
  const getItem = z.request('https://deliver.kenticocloud.com/' + projectId + '/items/' + payloadDataItems.codename, {
      params: {
        projectId: projectId,
        contentType: contentType,
        payloadOperation: payloadOperation
      }
  });
  
  /** 
   * Make the request in case content item gets published and is wanted content type
   */
  if ((payloadOperation === 'publish') && (contentType === payloadDataItems.type)) {
    return getItem.then((response) => {
      var item = JSON.parse(response.content).item,
          response = [];

      item.id = 0;
      response.push(item); 
      return response; // Zapier takes array as input
    });
  } else {
    return []; // In Zapier Task History the operation becomes halted
  }
};

/** 
 * Dynamic field that gets content types based on projectId
 */
const typesField = (z, bundle) => {
  var choices = {};

  // If "Project ID" field is not empty       
  if (bundle.inputData.projectId) {
    const getTypes = z.request('https://deliver.kenticocloud.com/' + bundle.inputData.projectId + '/types');

    // Get types from Kentico Cloud project and display drop-down field with those types in the Zapier UI
    return getTypes.then((response) => {
      var items = JSON.parse(response.content).types;
      items.forEach((value, index) => {
        choices[items[index].system.codename] = items[index].system.name;
      });
      return [{key: 'contentType', label: 'Content type name (Static value)', required: true, choices: choices, helpText: 'Select one of the content types that should be watched.'}];    
    });
  }

  // Display empty drop-down list if "Project ID" field is empty 
  return [{key: 'contentType', label: 'Content type name (Static value)', required: true, helpText: 'Insert codename of content type that should be watched or click the "Refresh fields" button below to retrieve types available in your Kentico Cloud project.'}];     
};
  
/**
 * Zapier object for it's internal needs
 */
module.exports = {
  key: 'kentico_cloud',
  noun: 'Kentico Cloud',
  display: {
    label: 'Kentico Cloud Content',
    description: 'Find content items in the Kentico Cloud storage.'
  },
  operation: {
    inputFields: [
      {key: 'payload', label: 'Payload data (Raw Body value)', type: 'string', required: true, helpText: 'Select "Raw Body" item from the drop-down list.'}, // Dynamic payload 
      {key: 'projectId', label: 'Project ID (Static value)', type: 'string', required: true, altersDynamicFields: true, helpText: 'Copy Project ID from your Kentico Cloud project and paste it here.'}, // Kentico Cloud Project ID
      typesField // Dynamic field that depends on the "projectId" field value
    ],
    perform: getElement
  }
};