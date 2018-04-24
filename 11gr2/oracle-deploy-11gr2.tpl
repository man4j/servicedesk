<@requirement.PARAM name='NEW_DB' value='false' type='boolean' />
<@requirement.PARAM name='VOLUME_DRIVER' value='local' values='vmware,do,local' type='select' />
<@requirement.PARAM name='PORT_MUTEX' value='11222' type='number' />

<@requirement.CONFORMS>
  <@swarm.NETWORK 'network-${namespace}' />

  <@swarm.SERVICE 'swarmstorage-oracle-${namespace}' 'imagenarium/swarmstorage:0.5.0'>
    <@service.NETWORK 'network-${namespace}' />
    <@node.MANAGER />
  </@swarm.SERVICE>

  <@swarm.TASK 'oracle-${namespace}' 'imagenarium/oracle:11gR2_9'>
    <@container.NETWORK 'network-${namespace}' />
    <@container.VOLUME 'oracle-volume-${namespace}' '/opt/oracle' PARAMS.VOLUME_DRIVER />
    <@container.ENV 'STORAGE_SERVICE' 'swarmstorage-oracle-${namespace}' />
    <@container.ENV 'NEW_DB' PARAMS.NEW_DB />
  </@swarm.TASK>

  <@swarm.TASK_RUNNER 'oracle-${namespace}'>
    <@service.ENV 'SERVICE_PORTS' '1521' />
    <@service.NETWORK 'network-${namespace}' />
    <@service.PORT_MUTEX PARAMS.PORT_MUTEX />
  </@swarm.TASK_RUNNER>

  <@docker.CONTAINER 'oracle-checker-${namespace}' 'imagenarium/oracle_checker:latest'>
    <@container.NETWORK 'network-${namespace}' />
    <@container.ENV 'URL' 'system/oracle@//oracle-${namespace}:1521/orcl' />
    <@container.EPHEMERAL />
  </@docker.CONTAINER>
</@requirement.CONFORMS>