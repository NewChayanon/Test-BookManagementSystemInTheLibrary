const mapper = {};

mapper.registerMapper = (data) => ({ id: data.id, email: data.email });

module.exports = mapper;
