<@requirement.PARAM name='PUBLISHED_PORT' value='8080' type='number' />
<@requirement.PARAM name='BASE_URL' value='http://localhost:8080/sd' />
<@requirement.PARAM name='NEW_DB' value='false' type='boolean' />
<@requirement.PARAM name='ORACLE_SID' value='orcl' />
<@requirement.PARAM name='ORACLE_USER' value='system' />
<@requirement.PARAM name='ORACLE_PASSWORD' value='oracle' />
<@requirement.PARAM name='VOLUME_DRIVER' value='local' values='vmware,do,local' type='select' />
<@requirement.PARAM name='PORT_MUTEX' value='11222' type='number' />

<@requirement.CONFORMS>
  <@swarm.NETWORK 'network-${namespace}' />

  <@swarm.SERVICE 'swarmstorage-servicedesk-${namespace}' 'imagenarium/swarmstorage:0.5.0'>
    <@service.NETWORK 'network-${namespace}' />
    <@node.MANAGER />
  </@swarm.SERVICE>

  <@swarm.TASK 'servicedesk-${namespace}' 'imagenarium/servicedesk:0.4'>
    <@container.NETWORK 'network-${namespace}' />
    <@container.VOLUME 'servicedesk-volume-${namespace}' '/opt/nausd40/data' PARAMS.VOLUME_DRIVER />
    <@container.ENV 'NEW_DB' PARAMS.NEW_DB />
    <@container.ENV 'STORAGE_SERVICE' 'swarmstorage-servicedesk-${namespace}' />
    <@container.ENV 'BASE_URL' PARAMS.BASE_URL />
    <@container.ENV 'ORACLE_HOSTNAME' 'oracle-${namespace}' />
    <@container.ENV 'ORACLE_SID' PARAMS.ORACLE_SID />
    <@container.ENV 'ORACLE_USER' PARAMS.ORACLE_USER />
    <@container.ENV 'ORACLE_PASSWORD' PARAMS.ORACLE_PASSWORD />
  </@swarm.TASK>

  <@swarm.TASK_RUNNER 'servicedesk-${namespace}'>
    <@service.PORT PARAMS.PUBLISHED_PORT '8080' />
    <@service.ENV 'SERVICE_PORTS' '8080' />
    <@service.NETWORK 'network-${namespace}' />
    <@service.PORT_MUTEX PARAMS.PORT_MUTEX />
  </@swarm.TASK_RUNNER>

  <@docker.HTTP_CHECK 'http://servicedesk-${namespace}:8080/sd/services/rest/check-status' 'network-${namespace}' />
</@requirement.CONFORMS>
