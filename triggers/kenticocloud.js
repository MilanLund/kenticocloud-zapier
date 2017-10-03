const getProject = (z, bundle) => {
  z.console.log(bundle.inputData.projectId + 'xxxx');
  const promise = z.request('https://deliver.kenticocloud.com/' + bundle.inputData.projectId + '/types', {
    // NEW CODE
    params: {
      projectId: bundle.inputData.projectId
    }
  });
  return promise.then((response) => {
    var types = JSON.parse(response.content).types;

    types.forEach((value, index) => {
      types[index]['id'] = index;
    });

    return types;
  });
};

module.exports = {
  key: 'kenticocloud',
  noun: 'Kentico Cloud',
  display: {
    label: 'New Project',
    description: 'Trigger when a Kentico Cloud project is updated.'
  },
  operation: {
    // NEW CODE
    inputFields: [
      {key: 'projectId', type: 'string', required: true}
    ],
    perform: getProject
  }
};