#!/usr/bin/env node
import inquirer from 'inquirer';

const API_URL = `http://localhost:${process.env.API_PORT || 3847}`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'grupos':
    case 'groups':
      await selectGroups();
      break;
    case 'ver':
    case 'list':
      await viewMonitored();
      break;
    case 'status':
      await checkStatus();
      break;
    default:
      showHelp();
  }
}

function showHelp() {
  console.log(`
WhatsApp Dollar Monitor - CLI

Comandos:
  grupos    Seleccionar grupos a monitorear
  ver       Ver grupos monitoreados actualmente
  status    Verificar si el monitor está corriendo

Ejemplos:
  npm run config grupos
  npm run config ver
  npm run config status

Nota: El monitor debe estar corriendo (npm start) para usar estos comandos.
`);
}

async function api(path, options = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    return await res.json();
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('\n❌ El monitor no está corriendo.');
      console.log('   Primero ejecuta: npm start\n');
      process.exit(1);
    }
    throw error;
  }
}

async function checkStatus() {
  const data = await api('/status');
  if (data.ok) {
    console.log(`\n✅ Monitor activo (estado: ${data.state})\n`);
  } else {
    console.log('\n❌ Error:', data.error, '\n');
  }
}

async function viewMonitored() {
  const data = await api('/monitoreados');

  if (!data.ok) {
    console.log('\n❌ Error:', data.error, '\n');
    return;
  }

  if (data.groups.length === 0) {
    console.log('\n⚠️  No hay grupos monitoreados');
    console.log('   Usa "npm run config grupos" para seleccionar\n');
    return;
  }

  console.log(`\n👀 Grupos monitoreados (${data.groups.length}):\n`);
  data.groups.forEach((group, i) => {
    console.log(`   ${i + 1}. ${group.name}`);
  });
  console.log('');
}

async function selectGroups() {
  console.log('\n⏳ Obteniendo grupos...\n');

  const data = await api('/grupos');

  if (!data.ok) {
    console.log('❌ Error:', data.error, '\n');
    return;
  }

  if (data.groups.length === 0) {
    console.log('⚠️  No hay grupos disponibles\n');
    return;
  }

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Selecciona los grupos a monitorear:',
      choices: data.groups.map((group) => ({
        name: group.name,
        value: { id: group.id, name: group.name },
        checked: group.monitored,
      })),
      pageSize: 15,
      loop: false,
    },
  ]);

  // Guardar selección via API
  const saveResult = await api('/monitoreados', {
    method: 'POST',
    body: JSON.stringify({ groups: selected }),
  });

  if (saveResult.ok) {
    if (selected.length > 0) {
      console.log(`\n✅ Guardados ${selected.length} grupo(s):`);
      selected.forEach((g) => console.log(`   • ${g.name}`));
    } else {
      console.log('\n⚠️  No hay grupos seleccionados.');
    }
    console.log('\n💡 Los cambios se aplican inmediatamente.\n');
  } else {
    console.log('\n❌ Error guardando:', saveResult.error, '\n');
  }
}

main();
