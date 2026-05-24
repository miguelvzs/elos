// =====================================================
// ELOS - Sistema de Gerenciamento
// Lógica principal com LocalStorage
// =====================================================

// ---- TOAST NOTIFICATIONS ----
function showToast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---- NAVIGATION ----
function navigate(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll(`.nav-links a[data-page="${page}"]`).forEach(a => a.classList.add('active'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Close mobile menu
  document.querySelector('.nav-links').classList.remove('open');
  updateStats();
}

// ---- TABS ----
function switchTab(tabGroup, tabId) {
  document.querySelectorAll(`[data-tab-group="${tabGroup}"]`).forEach(el => el.classList.remove('active'));
  document.querySelectorAll(`[data-tab-content="${tabGroup}"]`).forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-tab-group="${tabGroup}"][data-tab-id="${tabId}"]`).classList.add('active');
  document.getElementById(`${tabGroup}-${tabId}`).classList.add('active');
}

// =====================================================
// STORAGE HELPERS
// =====================================================
const DB = {
  get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  genId: () => Date.now().toString(36) + Math.random().toString(36).substr(2)
};

// =====================================================
// USUÁRIOS
// =====================================================
const usuarios = {
  save(data) {
    const list = DB.get('usuarios');
    list.push({ id: DB.genId(), ...data, criadoEm: new Date().toLocaleDateString('pt-BR') });
    DB.set('usuarios', list);
  },
  update(id, data) {
    const list = DB.get('usuarios').map(u => u.id === id ? { ...u, ...data } : u);
    DB.set('usuarios', list);
  },
  delete(id) {
    DB.set('usuarios', DB.get('usuarios').filter(u => u.id !== id));
  },
  all() { return DB.get('usuarios'); },
  find(id) { return DB.get('usuarios').find(u => u.id === id); }
};

function handleUsuarioForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.dataset.editId;
  const data = {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    telefone: form.telefone.value.trim(),
    cpf: form.cpf.value.trim(),
    tipo: form.tipo.value,
    nascimento: form.nascimento.value,
  };
  if (!data.nome || !data.email) return showToast('Preencha os campos obrigatórios', 'error');
  if (id) {
    usuarios.update(id, data);
    delete form.dataset.editId;
    form.querySelector('button[type=submit]').textContent = '➕ Cadastrar Usuário';
    showToast('Usuário atualizado com sucesso!');
  } else {
    // check duplicated email
    if (usuarios.all().some(u => u.email === data.email)) return showToast('E-mail já cadastrado!', 'error');
    usuarios.save(data);
    showToast('Usuário cadastrado com sucesso!');
  }
  form.reset();
  renderUsuarios();
}

function editUsuario(id) {
  const u = usuarios.find(id);
  const form = document.getElementById('formUsuario');
  form.nome.value = u.nome;
  form.email.value = u.email;
  form.telefone.value = u.telefone || '';
  form.cpf.value = u.cpf || '';
  form.tipo.value = u.tipo || 'usuario';
  form.nascimento.value = u.nascimento || '';
  form.dataset.editId = id;
  form.querySelector('button[type=submit]').textContent = '💾 Salvar Alterações';
  switchTab('usuarios', 'cadastro');
  document.getElementById('formUsuario').scrollIntoView({ behavior: 'smooth' });
  showToast('Editando usuário...', 'info');
}

function deleteUsuario(id) {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    usuarios.delete(id);
    renderUsuarios();
    showToast('Usuário removido!', 'info');
  }
}

function renderUsuarios(search = '') {
  const tbody = document.getElementById('usuariosBody');
  const list = usuarios.all().filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">👤</div><p>Nenhum usuário encontrado</p></div></td></tr>`;
    return;
  }
  const typeBadge = { admin: 'badge-purple', usuario: 'badge-blue', moderador: 'badge-green' };
  tbody.innerHTML = list.map(u => `
    <tr>
      <td><strong style="color:var(--text)">${u.nome}</strong></td>
      <td>${u.email}</td>
      <td>${u.telefone || '—'}</td>
      <td>${u.cpf || '—'}</td>
      <td><span class="badge ${typeBadge[u.tipo] || 'badge-blue'}">${u.tipo || 'usuário'}</span></td>
      <td>${u.criadoEm}</td>
      <td>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-secondary btn-sm" onclick="editUsuario('${u.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUsuario('${u.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// =====================================================
// ENDEREÇOS
// =====================================================
const enderecos = {
  save(data) {
    const list = DB.get('enderecos');
    list.push({ id: DB.genId(), ...data, criadoEm: new Date().toLocaleDateString('pt-BR') });
    DB.set('enderecos', list);
  },
  update(id, data) { DB.set('enderecos', DB.get('enderecos').map(e => e.id === id ? { ...e, ...data } : e)); },
  delete(id) { DB.set('enderecos', DB.get('enderecos').filter(e => e.id !== id)); },
  all() { return DB.get('enderecos'); },
  find(id) { return DB.get('enderecos').find(e => e.id === id); }
};

function handleEnderecoForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.dataset.editId;
  const data = {
    usuario: form.usuarioEnd.value.trim(),
    cep: form.cep.value.trim(),
    rua: form.rua.value.trim(),
    numero: form.numero.value.trim(),
    complemento: form.complemento.value.trim(),
    bairro: form.bairro.value.trim(),
    cidade: form.cidade.value.trim(),
    estado: form.estado.value,
    tipo: form.tipoEnd.value,
  };
  if (!data.rua || !data.cidade) return showToast('Preencha os campos obrigatórios', 'error');
  if (id) {
    enderecos.update(id, data);
    delete form.dataset.editId;
    form.querySelector('button[type=submit]').textContent = '➕ Cadastrar Endereço';
    showToast('Endereço atualizado!');
  } else {
    enderecos.save(data);
    showToast('Endereço cadastrado com sucesso!');
  }
  form.reset();
  renderEnderecos();
}

function editEndereco(id) {
  const e = enderecos.find(id);
  const form = document.getElementById('formEndereco');
  form.usuarioEnd.value = e.usuario;
  form.cep.value = e.cep;
  form.rua.value = e.rua;
  form.numero.value = e.numero;
  form.complemento.value = e.complemento || '';
  form.bairro.value = e.bairro;
  form.cidade.value = e.cidade;
  form.estado.value = e.estado;
  form.tipoEnd.value = e.tipo;
  form.dataset.editId = id;
  form.querySelector('button[type=submit]').textContent = '💾 Salvar Alterações';
  switchTab('enderecos', 'cadastro');
  showToast('Editando endereço...', 'info');
}

function deleteEndereco(id) {
  if (confirm('Excluir este endereço?')) { enderecos.delete(id); renderEnderecos(); showToast('Endereço removido!', 'info'); }
}

function renderEnderecos(search = '') {
  const tbody = document.getElementById('enderecosBody');
  const list = enderecos.all().filter(e =>
    (e.rua + e.cidade + e.usuario).toLowerCase().includes(search.toLowerCase())
  );
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📍</div><p>Nenhum endereço cadastrado</p></div></td></tr>`;
    return;
  }
  const typeBadge = { residencial: 'badge-blue', comercial: 'badge-green', outro: 'badge-yellow' };
  tbody.innerHTML = list.map(e => `
    <tr>
      <td><strong style="color:var(--text)">${e.usuario}</strong></td>
      <td>${e.rua}, ${e.numero}</td>
      <td>${e.bairro}</td>
      <td>${e.cidade}</td>
      <td>${e.estado}</td>
      <td><span class="badge ${typeBadge[e.tipo] || 'badge-blue'}">${e.tipo}</span></td>
      <td>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-secondary btn-sm" onclick="editEndereco('${e.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEndereco('${e.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ---- CEP AUTO-FILL ----
async function buscarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const d = await r.json();
    if (d.erro) return showToast('CEP não encontrado', 'error');
    const form = document.getElementById('formEndereco');
    form.rua.value = d.logradouro || '';
    form.bairro.value = d.bairro || '';
    form.cidade.value = d.localidade || '';
    form.estado.value = d.uf || '';
    form.numero.focus();
    showToast('Endereço preenchido automaticamente!', 'info');
  } catch { showToast('Erro ao buscar CEP', 'error'); }
}

// =====================================================
// LOCAIS / ESTABELECIMENTOS
// =====================================================
const locais = {
  save(data) {
    const list = DB.get('locais');
    list.push({ id: DB.genId(), ...data, criadoEm: new Date().toLocaleDateString('pt-BR') });
    DB.set('locais', list);
  },
  update(id, data) { DB.set('locais', DB.get('locais').map(l => l.id === id ? { ...l, ...data } : l)); },
  delete(id) { DB.set('locais', DB.get('locais').filter(l => l.id !== id)); },
  all() { return DB.get('locais'); },
  find(id) { return DB.get('locais').find(l => l.id === id); }
};

function handleLocalForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.dataset.editId;
  const data = {
    nome: form.nomeLocal.value.trim(),
    categoria: form.categoria.value,
    endereco: form.endLocal.value.trim(),
    cidade: form.cidadeLocal.value.trim(),
    telefone: form.telLocal.value.trim(),
    site: form.siteLocal.value.trim(),
    descricao: form.descLocal.value.trim(),
    lat: parseFloat(form.lat.value) || -22.5,
    lng: parseFloat(form.lng.value) || -43.1,
  };
  if (!data.nome || !data.endereco) return showToast('Preencha os campos obrigatórios', 'error');
  if (id) {
    locais.update(id, data);
    delete form.dataset.editId;
    form.querySelector('button[type=submit]').textContent = '➕ Cadastrar Local';
    showToast('Local atualizado!');
  } else {
    locais.save(data);
    showToast('Estabelecimento cadastrado!');
  }
  form.reset();
  renderLocais();
  renderMapMarkers();
}

function editLocal(id) {
  const l = locais.find(id);
  const form = document.getElementById('formLocal');
  form.nomeLocal.value = l.nome;
  form.categoria.value = l.categoria;
  form.endLocal.value = l.endereco;
  form.cidadeLocal.value = l.cidade;
  form.telLocal.value = l.telefone || '';
  form.siteLocal.value = l.site || '';
  form.descLocal.value = l.descricao || '';
  form.lat.value = l.lat || '';
  form.lng.value = l.lng || '';
  form.dataset.editId = id;
  form.querySelector('button[type=submit]').textContent = '💾 Salvar Alterações';
  switchTab('locais', 'cadastro');
  showToast('Editando local...', 'info');
}

function deleteLocal(id) {
  if (confirm('Excluir este local?')) { locais.delete(id); renderLocais(); renderMapMarkers(); showToast('Local removido!', 'info'); }
}

const catBadge = { restaurante: 'badge-yellow', loja: 'badge-blue', servico: 'badge-green', saude: 'badge-purple', educacao: 'badge-blue', lazer: 'badge-green', outro: 'badge-yellow' };

function renderLocais(search = '') {
  const tbody = document.getElementById('locaisBody');
  const list = locais.all().filter(l =>
    (l.nome + l.categoria + l.cidade).toLowerCase().includes(search.toLowerCase())
  );
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">🏪</div><p>Nenhum estabelecimento cadastrado</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(l => `
    <tr>
      <td><strong style="color:var(--text)">${l.nome}</strong></td>
      <td><span class="badge ${catBadge[l.categoria] || 'badge-blue'}">${l.categoria}</span></td>
      <td>${l.endereco}</td>
      <td>${l.cidade}</td>
      <td>${l.telefone || '—'}</td>
      <td>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-secondary btn-sm" onclick="editLocal('${l.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteLocal('${l.id}')">🗑️</button>
          <button class="btn btn-success btn-sm" onclick="verNoMapa('${l.id}')">🗺️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// MAP
let map, markersLayer = [];

function initMap() {
  if (map) return;
  map = L.map('map').setView([-22.9068, -43.1729], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
  setTimeout(() => { map.invalidateSize(); renderMapMarkers(); }, 300);
}

function renderMapMarkers() {
  if (!map) return;
  markersLayer.forEach(m => map.removeLayer(m));
  markersLayer = [];
  const list = locais.all();
  list.forEach(l => {
    if (l.lat && l.lng) {
      const marker = L.marker([l.lat, l.lng])
        .addTo(map)
        .bindPopup(`<strong>${l.nome}</strong><br><em>${l.categoria}</em><br>${l.endereco}, ${l.cidade}`);
      markersLayer.push(marker);
    }
  });
  if (markersLayer.length > 0) {
    const group = L.featureGroup(markersLayer);
    map.fitBounds(group.getBounds().pad(0.3));
  }
}

function verNoMapa(id) {
  const l = locais.find(id);
  navigate('locais');
  switchTab('locais', 'mapa');
  setTimeout(() => {
    initMap();
    if (l.lat && l.lng) map.setView([l.lat, l.lng], 15);
    const marker = markersLayer.find((m, i) => {
      const pos = m.getLatLng();
      return Math.abs(pos.lat - l.lat) < 0.001 && Math.abs(pos.lng - l.lng) < 0.001;
    });
    if (marker) marker.openPopup();
  }, 400);
}

// =====================================================
// CONTATO / MENSAGENS
// =====================================================
const mensagens = {
  save(data) {
    const list = DB.get('mensagens');
    list.push({ id: DB.genId(), ...data, criadoEm: new Date().toLocaleString('pt-BR'), lida: false });
    DB.set('mensagens', list);
  },
  markRead(id) { DB.set('mensagens', DB.get('mensagens').map(m => m.id === id ? { ...m, lida: true } : m)); },
  delete(id) { DB.set('mensagens', DB.get('mensagens').filter(m => m.id !== id)); },
  all() { return DB.get('mensagens'); }
};

function handleContatoForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    nome: form.nomeContato.value.trim(),
    email: form.emailContato.value.trim(),
    assunto: form.assunto.value.trim(),
    mensagem: form.mensagem.value.trim(),
  };
  if (!data.nome || !data.email || !data.mensagem) return showToast('Preencha todos os campos', 'error');
  mensagens.save(data);
  form.reset();
  showToast('Mensagem enviada com sucesso! ✉️');
  renderMensagens();
}

function renderMensagens() {
  const container = document.getElementById('mensagensList');
  const list = mensagens.all().reverse();
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><p>Nenhuma mensagem ainda</p></div>`;
    return;
  }
  container.innerHTML = list.map(m => `
    <div class="msg-item" style="${!m.lida ? 'border-left:3px solid var(--accent)' : ''}">
      <div class="msg-meta">
        <strong style="color:var(--text)">${m.nome}</strong> &lt;${m.email}&gt; — ${m.criadoEm}
        ${!m.lida ? '<span class="badge badge-blue" style="margin-left:0.5rem">Nova</span>' : ''}
      </div>
      <div style="font-size:0.8rem;color:var(--accent);margin-bottom:0.25rem">Assunto: ${m.assunto || '(sem assunto)'}</div>
      <div class="msg-text">${m.mensagem}</div>
      <div style="display:flex;gap:0.5rem;margin-top:0.75rem">
        ${!m.lida ? `<button class="btn btn-success btn-sm" onclick="mensagens.markRead('${m.id}');renderMensagens()">✅ Marcar como lida</button>` : ''}
        <button class="btn btn-danger btn-sm" onclick="mensagens.delete('${m.id}');renderMensagens();showToast('Mensagem removida','info')">🗑️ Excluir</button>
      </div>
    </div>
  `).join('');
}

// =====================================================
// STATS
// =====================================================
function updateStats() {
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('stat-usuarios', usuarios.all().length);
  setEl('stat-enderecos', enderecos.all().length);
  setEl('stat-locais', locais.all().length);
  setEl('stat-mensagens', mensagens.all().filter(m => !m.lida).length);
}

// =====================================================
// EXPORT DATA
// =====================================================
function exportData() {
  const data = {
    usuarios: usuarios.all(),
    enderecos: enderecos.all(),
    locais: locais.all(),
    mensagens: mensagens.all(),
    exportadoEm: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nexus-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exportado com sucesso!');
}

function clearAllData() {
  if (confirm('ATENÇÃO: Isso apagará TODOS os dados. Tem certeza?')) {
    localStorage.clear();
    showToast('Todos os dados foram apagados.', 'info');
    renderUsuarios(); renderEnderecos(); renderLocais(); renderMensagens(); updateStats();
  }
}

// =====================================================
// SEED DATA (dados de exemplo)
// =====================================================
function seedData() {
  if (DB.get('usuarios').length > 0) return;
  const u = [
    { nome: 'Ana Silva', email: 'ana@email.com', telefone: '(11) 4034-7800', cpf: '123.456.789-00', tipo: 'admin', nascimento: '1995-03-15' },
    { nome: 'Bruno Costa', email: 'bruno@email.com', telefone: '(11) 98888-5678', cpf: '987.654.321-00', tipo: 'usuario', nascimento: '1990-07-22' },
    { nome: 'Carla Mendes', email: 'carla@email.com', telefone: '(11) 97777-9012', cpf: '456.789.123-00', tipo: 'moderador', nascimento: '1998-11-30' },
  ];
  u.forEach(d => usuarios.save(d));

  const e = [
    { usuario: 'Ana Silva', cep: '12903-000', rua: 'Av. Major Fernando Valle', numero: '2013', bairro: 'São Miguel', cidade: 'Bragança Paulista', estado: 'SP', tipo: 'comercial' },
    { usuario: 'Bruno Costa', cep: '12903-000', rua: 'Av. Major Fernando Valle', numero: '2013', bairro: 'São Miguel', cidade: 'Bragança Paulista', estado: 'SP', tipo: 'outro' },
  ];
  e.forEach(d => enderecos.save(d));

  const l = [
    { nome: 'IFSP — Campus Bragança Paulista', categoria: 'educacao', endereco: 'Av. Major Fernando Valle, 2013', cidade: 'Bragança Paulista', telefone: '(11) 4034-7800', site: 'https://bra.ifsp.edu.br', descricao: 'Instituto Federal de São Paulo — Campus BRA', lat: -22.9468, lng: -46.5371 },
    { nome: 'Prefeitura de Bragança Paulista', categoria: 'servico', endereco: 'Praça Anchieta, 1', cidade: 'Bragança Paulista', telefone: '(11) 4035-9000', site: '', descricao: 'Sede da Prefeitura Municipal', lat: -22.9531, lng: -46.5418 },
    { nome: 'UPA Bragança Paulista', categoria: 'saude', endereco: 'Av. Antônio Frederico Ozanan, s/n', cidade: 'Bragança Paulista', telefone: '(11) 4033-0900', site: '', descricao: 'Unidade de Pronto Atendimento 24h', lat: -22.9510, lng: -46.5480 },
  ];
  l.forEach(d => locais.save(d));
}

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  seedData();

  // Navigation links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) navigate(page);
    });
  });

  // Hero buttons
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tabGroup, btn.dataset.tabId));
  });

  // Forms
  document.getElementById('formUsuario').addEventListener('submit', handleUsuarioForm);
  document.getElementById('formEndereco').addEventListener('submit', handleEnderecoForm);
  document.getElementById('formLocal').addEventListener('submit', handleLocalForm);
  document.getElementById('formContato').addEventListener('submit', handleContatoForm);

  // CEP
  document.getElementById('cepInput').addEventListener('blur', (e) => buscarCEP(e.target.value));

  // Search boxes
  document.getElementById('searchUsuario').addEventListener('input', e => renderUsuarios(e.target.value));
  document.getElementById('searchEndereco').addEventListener('input', e => renderEnderecos(e.target.value));
  document.getElementById('searchLocal').addEventListener('input', e => renderLocais(e.target.value));

  // Hamburger
  document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });

  // Map init on tab click
  document.querySelector('[data-tab-id="mapa"]')?.addEventListener('click', () => {
    setTimeout(() => { initMap(); }, 100);
  });

  // Initial render
  renderUsuarios();
  renderEnderecos();
  renderLocais();
  renderMensagens();
  updateStats();
  navigate('home');
});