/**
 * 用户管理页面JavaScript
 */

let menuList = []; // 存储菜单列表

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
  // 检查登录状态
  if (!AuthUtil.checkLogin()) {
    return;
  }

  // 加载用户信息
  loadUserInfo();
  
  // 加载菜单列表
  loadMenuList();
  
  // 加载用户列表
  loadUserList();
});

// 加载用户信息
async function loadUserInfo() {
  try {
    const userInfo = await AuthUtil.getUserInfo();
    document.getElementById('currentUser').textContent = '欢迎，' + (userInfo.nickname || userInfo.username);
  } catch (error) {
    console.error('加载用户信息失败:', error);
  }
}

// 加载菜单列表
async function loadMenuList() {
  try {
    const result = await HttpUtil.get('/api/user/menu/list');
    menuList = result.data || [];
    
    // 渲染权限复选框
    renderPermissionCheckboxes('permissionCheckboxes', []);
  } catch (error) {
    console.error('加载菜单列表失败:', error);
  }
}

// 渲染权限复选框
function renderPermissionCheckboxes(containerId, selectedPermissions) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  menuList.forEach(menu => {
    const div = document.createElement('div');
    div.className = 'checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${containerId}_${menu.dictValue}`;
    checkbox.value = menu.dictValue;
    checkbox.checked = selectedPermissions.includes(menu.dictValue);
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = menu.dictName;
    
    div.appendChild(checkbox);
    div.appendChild(label);
    container.appendChild(div);
  });
}

// 获取选中的权限
function getSelectedPermissions(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return '';
  
  const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
  const values = Array.from(checkboxes).map(cb => cb.value);
  return values.join(',');
}

// 加载用户列表
async function loadUserList() {
  try {
    const result = await HttpUtil.get('/api/user/list');
    const userList = result.data || [];
    
    renderUserTable(userList);
  } catch (error) {
    console.error('加载用户列表失败:', error);
    showMessage('userTableBody', '加载用户列表失败', 'error');
  }
}

// 渲染用户表格
function renderUserTable(userList) {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;
  
  if (userList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-message">暂无用户数据</td></tr>';
    return;
  }
  
  tbody.innerHTML = userList.map(user => `
    <tr>
      <td>${user.username}</td>
      <td>${user.nickname || '-'}</td>
      <td>
        <span class="status-badge ${user.status === 1 ? 'status-active' : 'status-inactive'}">
          ${user.status === 1 ? '启用' : '禁用'}
        </span>
      </td>
      <td class="permissions-cell">${formatPermissions(user.menuPermissions)}</td>
      <td>
        <span class="${user.expirationTime ? 'expiration-time' : ''}" style="${isExpired(user.expirationTime) ? 'color: red; font-weight: bold;' : ''}">
          ${formatDateTime(user.expirationTime)}
        </span>
      </td>
      <td>${formatDateTime(user.lastLoginTime)}</td>
      <td>${formatDateTime(user.createTime)}</td>
      <td>${user.remark}</td>
      <td class="action-cell">
        <button onclick="toggleUserStatus(${user.id}, ${user.status})" class="btn-small btn-toggle">
          ${user.status === 1 ? '禁用' : '启用'}
        </button>
        <button onclick="showEditPermissionModal(${user.id}, '${user.menuPermissions || ''}')" class="btn-small btn-edit">
          编辑权限
        </button>
        <button onclick="showEditExpirationModal(${user.id}, '${user.expirationTime || ''}')" class="btn-small btn-expiration">
          编辑过期
        </button>
        <button onclick="deleteUser(${user.id})" class="btn-small btn-delete">
          删除
        </button>
      </td>
    </tr>
  `).join('');
}

// 格式化权限显示
function formatPermissions(permissions) {
  if (!permissions) return '-';
  
  const permissionArray = permissions.split(',');
  const permissionNames = permissionArray.map(perm => {
    const menu = menuList.find(m => m.dictValue === perm);
    return menu ? menu.dictName : perm;
  });
  
  return permissionNames.join('、') || '-';
}

// 格式化日期时间
function formatDateTime(dateTime) {
  if (!dateTime) return '-';
  
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 显示创建用户模态框
function showCreateUserModal() {
  document.getElementById('createUserModal').style.display = 'block';
  document.getElementById('createUserForm').reset();
  document.getElementById('createMessage').textContent = '';
  document.getElementById('createMessage').className = 'message';
  
  // 重新渲染权限复选框
  renderPermissionCheckboxes('permissionCheckboxes', []);
}

// 关闭创建用户模态框
function closeCreateUserModal() {
  document.getElementById('createUserModal').style.display = 'none';
}

// 处理创建用户表单提交
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('createUserForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const nickname = document.getElementById('nickname').value;
      // const email = document.getElementById('email').value;
      // const phone = document.getElementById('phone').value;
      const status = parseInt(document.getElementById('status').value);
      const remark = document.getElementById('remark').value;
      const menuPermissions = getSelectedPermissions('permissionCheckboxes');
      
      const messageEl = document.getElementById('createMessage');
      
      try {
        const result = await HttpUtil.post('/api/user/create', {
          username: username,
          password: password,
          nickname: nickname,
          // email: email,
          // phone: phone,
          status: status,
          menuPermissions: menuPermissions,
          remark: remark
        });
        
        messageEl.textContent = result.message || '创建成功';
        messageEl.className = 'message success';
        
        setTimeout(() => {
          closeCreateUserModal();
          loadUserList(); // 刷新用户列表
        }, 1500);
      } catch (error) {
        console.error('创建用户失败:', error);
        messageEl.textContent = error.message || '创建失败';
        messageEl.className = 'message error';
      }
    });
  }
});

// 切换用户状态
async function toggleUserStatus(userId, currentStatus) {
  const newStatus = currentStatus === 1 ? 0 : 1;
  const action = newStatus === 1 ? '启用' : '禁用';
  
  if (!confirm(`确定要${action}该用户吗？`)) {
    return;
  }
  
  try {
    await HttpUtil.put(`/api/user/${userId}/status?status=${newStatus}`);
    alert(`${action}成功`);
    loadUserList(); // 刷新用户列表
  } catch (error) {
    console.error(`${action}用户失败:`, error);
    alert(error.message || `${action}失败`);
  }
}

// 删除用户
async function deleteUser(userId) {
  if (!confirm('确定要删除该用户吗？此操作不可恢复！')) {
    return;
  }
  
  try {
    await HttpUtil.delete(`/api/user/${userId}`);
    alert('删除成功');
    loadUserList(); // 刷新用户列表
  } catch (error) {
    console.error('删除用户失败:', error);
    alert(error.message || '删除失败');
  }
}

// 显示编辑权限模态框
function showEditPermissionModal(userId, currentPermissions) {
  document.getElementById('editPermissionModal').style.display = 'block';
  document.getElementById('editUserId').value = userId;
  document.getElementById('editPermissionMessage').textContent = '';
  document.getElementById('editPermissionMessage').className = 'message';
  
  // 解析当前权限
  const permissionsArray = currentPermissions ? currentPermissions.split(',') : [];
  
  // 渲染权限复选框
  renderPermissionCheckboxes('editPermissionCheckboxes', permissionsArray);
}

// 关闭编辑权限模态框
function closeEditPermissionModal() {
  document.getElementById('editPermissionModal').style.display = 'none';
}

// 处理编辑权限表单提交
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('editPermissionForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const userId = document.getElementById('editUserId').value;
      const menuPermissions = getSelectedPermissions('editPermissionCheckboxes');
      
      const messageEl = document.getElementById('editPermissionMessage');
      
      try {
        await HttpUtil.put(`/api/user/${userId}/permissions?menuPermissions=${encodeURIComponent(menuPermissions)}`);
        
        messageEl.textContent = '权限更新成功';
        messageEl.className = 'message success';
        
        setTimeout(() => {
          closeEditPermissionModal();
          loadUserList(); // 刷新用户列表
        }, 1500);
      } catch (error) {
        console.error('更新权限失败:', error);
        messageEl.textContent = error.message || '更新失败';
        messageEl.className = 'message error';
      }
    });
  }
});

// 返回首页
function goBack() {
  window.location.href = '/index.html';
}

// 判断过期时间是否已过期
function isExpired(expirationTime) {
  if (!expirationTime) return false;
  return new Date(expirationTime) < new Date();
}

// 显示编辑过期时间模态框
function showEditExpirationModal(userId, currentExpirationTime) {
  document.getElementById('editExpirationModal').style.display = 'block';
  document.getElementById('expirationUserId').value = userId;
  document.getElementById('editExpirationMessage').textContent = '';
  document.getElementById('editExpirationMessage').className = 'message';

  // 将后端返回的时间格式转换为datetime-local格式
  if (currentExpirationTime) {
    const date = new Date(currentExpirationTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    document.getElementById('expirationTime').value = `${year}-${month}-${day}T${hours}:${minutes}`;
  } else {
    document.getElementById('expirationTime').value = '';
  }
}

// 关闭编辑过期时间模态框
function closeEditExpirationModal() {
  document.getElementById('editExpirationModal').style.display = 'none';
}

// 处理编辑过期时间表单提交
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('editExpirationForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const userId = document.getElementById('expirationUserId').value;
      const expirationTime = document.getElementById('expirationTime').value;

      const messageEl = document.getElementById('editExpirationMessage');

      try {
        // 格式化datetime-local为后端接受的格式
        let formattedTime = '';
        if (expirationTime) {
          formattedTime = expirationTime.replace('T', ' ') + ':00';
        }

        await HttpUtil.put(`/api/user/${userId}/expiration?expirationTime=${encodeURIComponent(formattedTime)}`);

        messageEl.textContent = '过期时间更新成功';
        messageEl.className = 'message success';

        setTimeout(() => {
          closeEditExpirationModal();
          loadUserList(); // 刷新用户列表
        }, 1500);
      } catch (error) {
        console.error('更新过期时间失败:', error);
        messageEl.textContent = error.message || '更新失败';
        messageEl.className = 'message error';
      }
    });
  }
});

// 显示消息（用于表格中）
function showMessage(containerId, message, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<tr><td colspan="10" class="${type}-message">${message}</td></tr>`;
}
