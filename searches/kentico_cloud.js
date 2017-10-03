const getContent = (z, bundle) => {
  const getTypes = z.request('https://deliver.kenticocloud.com/' + bundle.inputData.projectId + '/types', {
    params: {
      projectId: bundle.inputData.projectId
    }
  });

  return getTypes.then((response) => {
    var types = JSON.parse(response.content).types;
    return makePropertiesAccessible(types);
  });
};

const getElement = (z, bundle) => {
  const getItem = z.request('https://deliver.kenticocloud.com/' + bundle.inputData.projectId + '/items?system.type=' + bundle.inputData.contentType + '&system.codename=' + bundle.inputData.contentItem, {
      params: {
        projectId: bundle.inputData.projectId,
        contentType: bundle.inputData.contentType
      }
  });

  return getItem.then((response) => {
      var items = JSON.parse(response.content).items;
      return makePropertiesAccessible(items);
  });
};

const makePropertiesAccessible = (items) => {
  items.forEach((value, index) => {
    items[index]['id'] = index;
    items[index]['name'] = items[index]['system']['name'];
    items[index]['codename'] = items[index]['system']['codename'];
  });

  return items;
};

module.exports = {
  key: 'kentico_cloud',
  noun: 'Kenticocloud',

  display: {
    label: 'Find a Kenticocloud',
    description: 'Finds a kenticocloud.'
  },

  operation: {
    inputFields: [
      {key: 'projectId', label: 'Project ID', type: 'string', required: true},
      {key: 'contentType', label: 'Content type', type: 'string', required: true},
      {key: 'contentItem', label: 'Content item', type: 'string', required: true}
    ],
    perform: getElement
  }
};
