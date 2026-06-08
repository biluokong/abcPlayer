/**
 * 登录页面逻辑
 */

// 如果已登录，直接跳转到首页
if (AuthUtil.isLoggedIn()) {
    window.location.href = '/index.html';
}

// 获取DOM元素
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loginBtn = document.getElementById('loginBtn');
const btnText = loginBtn.querySelector('.btn-text');
const btnLoading = loginBtn.querySelector('.btn-loading');
const errorMessage = document.getElementById('errorMessage');

/**
 * 显示错误信息
 * @param {string} message - 错误消息
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

/**
 * 设置加载状态
 * @param {boolean} loading - 是否加载中
 */
function setLoading(loading) {
    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        loginBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        loginBtn.disabled = false;
    }
}

/**
 * 执行登录
 * @param {Event} e - 表单提交事件
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // 验证输入
    if (!username || !password) {
        showError('请输入用户名和密码');
        return;
    }
    
    // 开始加载
    setLoading(true);
    errorMessage.style.display = 'none';
    
    try {
        // 发送登录请求（使用表单提交方式）
        const result = await HttpUtil.postForm('/api/user/login', {
            username: username,
            password: password
        });
        
        if (result.code === 200 && result.data) {
            // 登录成功
            const { token, username: userName, nickname, menuPermissions } = result.data;
            
            // 保存Token和用户信息
            AuthUtil.saveToken(token);
            AuthUtil.saveUserInfo({
                username: userName,
                nickname: nickname,
                menuPermissions: menuPermissions
            });
            
            // 如果勾选了"记住我"，设置长期存储（这里简化处理）
            /*if (rememberMeCheckbox.checked) {
                // 可以在这里实现更复杂的记住我逻辑
                console.log('记住我功能已启用');
            }*/
            
            // 显示成功提示
            alert('登录成功！');
            
            // 跳转到首页
            window.location.href = '/index.html';
        } else {
            // 登录失败
            showError(result.message || '登录失败，请检查用户名和密码');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showError(error.message || '网络错误，请稍后重试');
    } finally {
        // 结束加载
        setLoading(false);
    }
}

// 绑定表单提交事件
loginForm.addEventListener('submit', handleLogin);

// 回车键提交
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin(e);
    }
});

// 页面加载时聚焦到用户名输入框
window.addEventListener('load', () => {
    usernameInput.focus();
});
