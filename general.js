const getForumHeader = (title) => {
    const pageTitle = title || 'Informaciones';

    let final = '';

    /* Poner el contenido del componente "cabespecial-foro" adaptado a esta vista. */
    /* INICIO */

    final += '<div class="forum-head special-head">';
    final += '<i class="fa-solid fa-caret-right"></i>';
    final += '<h3>';
    final += '<span>' + pageTitle + '</span>';
    final += '<small>' + FNR.utility.genSlug(pageTitle, ' ') + '</small>';
    final += '</h3>';
    final += '</div>';

    /* FIN */

    return final;
};

const getForumNotSupportedPage = (text, to) => {
    const msgText = text || 'Módulo no soportado. Redirigiendo al índice.';
    const msgTo = to || '/';

    let final = '';

    final += '<section id="forum-content" class="is-not-vue">';
    final += '<div class="to-process">';
    final += '<div id="breadcrumbs">';
    final += '<a href="#">Informaciones</a>';
    final += '</div>';
    final += '</div>';
    final += '<section id="message-section" class="basic-element">';
    final += '<section class="generic-element">';
    final += getForumHeader();
    final += '<div class="msg-element is-content">' + msgText + '</div>';
    final += '</section>';
    final += '</section>';
    final += '</section>';

    [].forEach.call(document.querySelectorAll('#content-container > *:not(#forum-topbar)'), (item) => {
        item.remove();
    });

    document.querySelector('#content-container').insertAdjacentHTML('beforeend', final);

    setTimeout(() => {
        window.location.replace(msgTo);
    }, 5000);
};

/* MENSAJES */
let forumProfiles = [];

document.addEventListener('DOMContentLoaded', () => {
    const processField = (item) => {
        if (item.querySelector('img')) return item.querySelector('img').src;
        else return item.innerHTML;
    };

    if (document.querySelector('#topic-section .postlist-post')) {
        [].forEach.call(document.querySelectorAll('#topic-section .postlist-post'), (item, index) => {
            if (item.id === 'post-0') {
                item.remove();
                return;
            }

            const userName = item.querySelector('.postprofile-username').textContent.trim();
            const userAvatar = item.querySelector('.postprofile-avatar img').src;
            const userGroup = item.querySelector('.postprofile-username span') ? FNR.utility.getGroup('rgb_' + item.querySelector('.postprofile-username span').style.color.split('rgb(')[1].split(')')[0].split(', ').join('_')) : 'unknown';
            let userFields = {};
            let userContact = {};

            if (item.querySelector('.postprofile-field')) {
                [].forEach.call(item.querySelectorAll('.postprofile-field'), (field) => {
                    const fieldName = field.querySelector('.postprofile-field-label .label span').textContent;
                    const fieldContent = processField(field.querySelector('.postprofile-field-content'));

                    userFields[FNR.utility.genSlug(fieldName, '_')] = {
                        name: fieldName,
                        content: fieldContent
                    };
                });
            }

            if (item.querySelector('.postprofile-rank').textContent.length) {
                userFields['rango'] = {
                    name: 'Rango',
                    content: item.querySelector('.postprofile-rank').textContent
                };
            }

            const userLink = item.querySelector('.postprofile-username a') ? item.querySelector('.postprofile-username a').href : userFields[forumConfig.profileOptions.profileRank].content === 'Invitado' ? '/' : FNR.user.getUrl(userName);

            if (item.querySelector('.postprofile-contact').children.length) {
                [].forEach.call(item.querySelector('.postprofile-contact').children, (field) => {
                    let fieldName = false;
                    let fieldTitle;
                    let fieldContent;
                    let fieldIcon;

                    if (field.querySelector('img')) {
                        switch (field.querySelector('img').src) {
                            case 'https://2img.net/i/fa/prosilver/icon_contact_pm.png':
                                fieldName = 'Contactar';
                                fieldTitle = 'Enviar un mensaje privado a «' + userName + '»';
                                fieldContent = field.querySelector('a').href;
                                fieldIcon = forumConfig.profileUser.contactFields['mp'];

                                break;

                            case 'https://2img.net/i.imgur.com/LbaEYDr.png':
                                fieldName = forumConfig.profileOptions.profileLinks.firstLink;
                                fieldTitle = 'Ir a ' + fieldName + ' de «' + userName + '»';
                                fieldContent = field.querySelector('a').href;
                                fieldIcon = forumConfig.profileUser.contactFields[FNR.utility.genSlug(fieldName, '_')];

                                break;

                            case 'https://2img.net/i.imgur.com/V9WL9zX.png':
                                fieldName = forumConfig.profileOptions.profileLinks.secondLink;
                                fieldTitle = 'Ir a ' + fieldName + ' de «' + userName + '»';
                                fieldContent = field.querySelector('a').href;
                                fieldIcon = forumConfig.profileUser.contactFields[FNR.utility.genSlug(fieldName, '_')];

                                break;

                            case 'https://2img.net/i.imgur.com/LprMCaL.png':
                                fieldName = forumConfig.profileOptions.profileLinks.thirdLink;
                                fieldTitle = 'Ir a ' + fieldName + ' de «' + userName + '»';
                                fieldContent = field.querySelector('a').href;
                                fieldIcon = forumConfig.profileUser.contactFields[FNR.utility.genSlug(fieldName, '_')];

                                break;
                        }
                    }

                    if (fieldName !== false) {
                        userContact[FNR.utility.genSlug(fieldName, '_')] = {
                            name: fieldName,
                            title: fieldTitle,
                            content: fieldContent,
                            icon: fieldIcon
                        };
                    }
                });
            }

            item.classList.add('usergroup-' + userGroup);
            item.querySelector('.post-profile').innerHTML = '';
            forumProfiles.push({
                username: userName,
                avatar: userAvatar,
                group: userGroup,
                profile: userLink,
                fields: userFields,
                contact: userContact
            });

            /* Código del perfil */
            const profile = item.querySelector('.post-profile');
            const signature = item.querySelector('.header-side');

            let html;

            html = '';

            html += '<a class="miniprofile-main" href="' + userLink + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + userName + '»"><img src="' + userAvatar + '" alt="Avatar de «' + userName + '»" /></a>';

            profile.insertAdjacentHTML('beforeend', html);
            profile.classList.add('profile-sticky');

            if (userFields[forumConfig.profileOptions.profileSignature] !== undefined) {
                html = '';

                html += '<a class="miniprofile-signature" href="' + userLink + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + userName + '»"><img class="is-avatar" src="' + userAvatar + '" alt="Avatar de «' + userName + '»" /><img class="is-signature" src="' + userFields[forumConfig.profileOptions.profileSignature].content + '" alt="Firma de «' + userName + '»" /></a>';

                signature.insertAdjacentHTML('beforebegin', html);

                html = '';

                html += '<div class="miniprofile-quote">' + userFields[forumConfig.profileOptions.profileCite].content + '</div>';

                signature.insertAdjacentHTML('beforeend', html);

                html = '';

                html += '<div class="miniprofile-name"></div>';

                signature.insertAdjacentHTML('beforeend', html);

                html = '';

                const versionedName = '<span class="is-hidden-tablet">' + Vue.filter('just-name')(userName) + '</span><span class="is-hidden-mobile">' + userName + '</span>';

                html += '<h3 class="is-tweakeable"><a class="is-measurable" href="' + userLink + '" title="Ir al ' + (forumConfig.profileOptions.profileName === undefined ? 'perfil' : forumConfig.profileOptions.profileName) + ' de «' + userName + '»">' + versionedName + '</a></h3>';

                signature.querySelector('.miniprofile-name').insertAdjacentHTML('beforeend', html);

                const rank = userFields[forumConfig.profileOptions.profileRank].content;

                delete userFields[forumConfig.profileOptions.profileSignature];
                delete userFields[forumConfig.profileOptions.profileCite];
                delete userFields[forumConfig.profileOptions.profileRank];
                delete userFields['rango'];

                if (Object.values(userFields).length) {
                    html = '';

                    html += '<ul class="miniprofile-fields">';

                    html += '<li class="miniprofile-field miniprofile-field-rango">';
                    html += '<strong>Rango</strong>' + rank;
                    html += '</li>';

                    forumConfig.profileUser.miniFields.forEach((name) => {
                        const field = userFields[name];

                        html += '<li class="miniprofile-field miniprofile-field-' + FNR.utility.genSlug(field.name, '-') + '">';
                        html += '<strong>' + field.name + '</strong>' + field.content;
                        html += '</li>';
                    });

                    html += '</ul>';

                    signature.insertAdjacentHTML('beforeend', html);
                }
            }

            if (Object.values(userContact).length) {
                html = '';

                html += '<ul class="miniprofile-contacts">';

                Object.values(userContact).forEach((field) => {
                    html += '<li class="miniprofile-contact miniprofile-contact-' + FNR.utility.genSlug(field.name, '-') + '">';
                    html += '<a href="' + field.content + '" title="' + field.title + '">' + field.name + '</a>';
                    html += '</li>';
                });

                html += '</ul>';

                profile.querySelector('.miniprofile-main').insertAdjacentHTML('afterend', html);

                if (signature.querySelector('.miniprofile-name')) {
                    signature.insertAdjacentHTML('beforeend', html);
                }
            }
        });
    }
});

/* PÁGINAS */
/* Login */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/login' && document.querySelector('form[name="form_login"]')) {
        let final = '';

        final += '<section id="forum-content" class="is-not-vue">';
        final += '<div class="to-process">';
        final += '<div id="breadcrumbs">';
        final += '<a href="#">Conectarse</a>';
        final += '</div>';
        final += '</div>';
        final += '<form action="/login" method="post" name="form_login" id="login-section" class="basic-element">';
        final += '<section class="generic-element">';
        final += getForumHeader('Conectarse al foro');
        final += '<ul class="columns is-vcentered is-multiline is-two-columns-page">';
        final += '<li id="bloque-login" class="column is-full-touch is-first">';
        final += '<ul class="forum-fieldlist is-horizontal no-style">';
        final += '<li class="field-element field-nombre-de-usuario">';
        final += '<div class="forum-field">';
        final += '<div class="field-name">Nombre de usuario</div>';
        final += '<div class="field-content"><input type="text" name="username" id="username" size="25" maxlength="40" value=""></div>';
        final += '</div>';
        final += '</li>';
        final += '<li class="field-element field-contrasena">';
        final += '<div class="forum-field">';
        final += '<div class="field-name">Contraseña</div>';
        final += '<div class="field-content"><input type="password" id="password" name="password" size="25" maxlength="25"></div>';
        final += '</div>';
        final += '</li>';
        final += '<li class="field-element mt-5">';
        final += '<div id="checkbox-autologin" class="forum-checkbox">';
        final += '<div class="checkbox-content">';
        final += '<div class="checkbox-click">';
        final += '<i class="fas fa-check"></i>';
        final += '</div>';
        final += '<div class="checkbox-name">Iniciar sesión automáticamente</div>';
        final += '</div>';
        final += '<div class="checkbox-real">';
        final += '<input type="checkbox" id="autologin" name="autologin" checked="checked">';
        final += '</div>';
        final += '</div>';
        final += '</li>';
        final += '</ul>';
        final += '<div id="usereply-comand">';
        final += '<input type="hidden" name="redirect" value="">';
        final += '<input type="hidden" name="query" value="">';
        final += '<input type="submit" name="login" value="Conectarse" class="button1 btn-main">';
        final += '<a class="button1" href="/profile?mode=sendpassword">Recuperar contraseña</a>';
        final += '</div>';
        final += '</li>';
        final += '<li id="bloque-info" class="column is-full-touch is-second">';
        final += '<div class="is-content">';
        final += '<h3 class="is-hidden-touch">¡Saludos!</h3>';
        final += '<hr class="is-hidden-touch"/>';
        final += '<p class="is-hidden-touch">' + forumData.desc + '</p>';
        final += '<p>Si aún no dispones de cuenta y estás interesado en unirte a nosotros puedes <a href="/register" title="Ir a «Registro»">registrarte</a> con suma facilidad, asimismo, te instamos a leerte nuestras <a href="' + forumConfig.usableDirections.norms + '" title="Ir a «Normativa»">normas</a> y <a href="' + forumConfig.usableDirections.lore + '" title="Ir a «Trasfondo»">trasfondo</a>.</p>';
        final += '<p class="is-hidden-touch">Atte. Administración de <strong>' + forumData.name + '</strong>.</p>';
        final += '</div>';
        final += '</li>';
        final += '</ul>';
        final += '</section>';
        final += '</form>';
        final += '</section>';

        [].forEach.call(document.querySelectorAll('#content-container > *:not(#forum-topbar)'), (item) => {
            item.remove();
        });

        document.querySelector('#content-container').insertAdjacentHTML('beforeend', final);
    }
});

/* Recuperar contraseña */
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('#main-body .msg-element')) {
        if (window.location.pathname === '/profile') {
            switch (window.location.search) {
                case '?mode=sendpassword':
                    let final = '';

                    final += '<section id="forum-content" class="is-not-vue">';
                    final += '<div class="to-process">';
                    final += '<div id="breadcrumbs">';
                    final += '<a href="#">Recuperar contraseña</a>';
                    final += '</div>';
                    final += '</div>';
                    final += '<form action="" method="post" id="login-section" class="basic-element">';
                    final += '<section class="generic-element">';
                    final += getForumHeader('Recuperar contraseña');
                    final += '<ul class="columns is-vcentered is-multiline is-two-columns-page">';
                    final += '<li id="bloque-login" class="column is-full-touch is-first">';
                    final += '<ul class="forum-fieldlist is-horizontal no-style">';
                    final += '<li class="field-element field-nombre-de-usuario">';
                    final += '<div class="forum-field">';
                    final += '<div class="field-name">Nombre de usuario</div>';
                    final += '<div class="field-content"><input type="text" name="username" value=""></div>';
                    final += '</div>';
                    final += '</li>';
                    final += '<li class="field-element field-correo">';
                    final += '<div class="forum-field">';
                    final += '<div class="field-name">Correo electrónico</div>';
                    final += '<div class="field-content"><input type="text" name="email" value=""></div>';
                    final += '</div>';
                    final += '</li>';
                    final += '</ul>';
                    final += '<div id="usereply-comand">';
                    final += '<input type="submit" name="submit" value="Enviar" class="button2 btn-main">';
                    final += '<input type="reset" name="reset" value="Reiniciar" class="button2">';
                    final += '</div>';
                    final += '</li>';
                    final += '<li id="bloque-info" class="column is-full-touch is-second">';
                    final += '<div class="is-content">';
                    final += '<h3 class="is-hidden-touch">¡Saludos!</h3>';
                    final += '<hr class="is-hidden-touch"/>';
                    final += '<p class="is-hidden-touch">' + forumData.desc + '</p>';
                    final += '<p>Tras pulsar el botón «Enviar» (si los datos son verídicos) recibirás un correo en tu cuenta con instrucciones sobre como reestablecer tu contraseña.</p>';
                    final += '<p class="is-hidden-touch">Atte. Administración de <strong>' + forumData.name + '</strong>.</p>';
                    final += '</div>';
                    final += '</li>';
                    final += '</ul>';
                    final += '</section>';
                    final += '</form>';
                    final += '</section>';

                    [].forEach.call(document.querySelectorAll('#content-container > *:not(#forum-topbar)'), (item) => {
                        item.remove();
                    });

                    document.querySelector('#content-container').insertAdjacentHTML('beforeend', final);
                    break;

                default:
                    if (window.location.search.indexOf('?change_password') > -1) {
                        document.querySelector('input[value="Registrar"]').classList.add('btn-main');

                        let final = '';

                        final += '<section id="forum-content" class="is-not-vue">';
                        final += '<div class="to-process">';
                        final += '<div id="breadcrumbs">';
                        final += '<a href="#">Cambiar contraseña</a>';
                        final += '</div>';
                        final += '</div>';
                        final += '<form action="/profile" enctype="multipart/form-data" method="post" name="post" id="login-section" class="basic-element">';
                        final += '<section class="generic-element">';
                        final += getForumHeader('Cambiar contraseña');
                        final += '<ul class="columns is-vcentered is-multiline is-two-columns-page">';
                        final += '<li id="bloque-login" class="column is-full-touch is-first">';
                        final += '<ul class="forum-fieldlist is-horizontal no-style">';
                        final += '<li class="field-element field-contrasena-actual">';
                        final += '<div class="forum-field">';
                        final += '<div class="field-name">Contraseña actual</div>';
                        final += '<div class="field-content"><input type="password" name="cur_password" value=""></div>';
                        final += '</div>';
                        final += '</li>';
                        final += '<li class="field-element field-nueva-contrasena">';
                        final += '<div class="forum-field">';
                        final += '<div class="field-name">Nueva contraseña</div>';
                        final += '<div class="field-content"><input type="password" name="new_password" value="" class="inputbox" maxlength="25"></div>';
                        final += '</div>';
                        final += '</li>';
                        final += '<li class="field-element field-confirmar-contrasena">';
                        final += '<div class="forum-field">';
                        final += '<div class="field-name">Confirmar contraseña</div>';
                        final += '<div class="field-content"><input type="password" name="password_confirm" value="" class="inputbox" maxlength="25"><input type="hidden" name="change_password" value="change_password"></div>';
                        final += '</div>';
                        final += '</li>';
                        final += '</ul>';
                        final += '<div id="usereply-comand">';
                        final += document.querySelector('#ucp .submit-buttons').innerHTML;
                        final += '</div>';
                        final += '</li>';
                        final += '<li id="bloque-info" class="column is-full-touch is-second">';
                        final += '<div class="is-content">';
                        final += '<h3 class="is-hidden-touch">¡Saludos!</h3>';
                        final += '<hr class="is-hidden-touch"/>';
                        final += '<p class="is-hidden-touch">' + forumData.desc + '</p>';
                        final += '<p>Tras pulsar el botón «Registrar» (si los datos son verídicos) podrás cambiar tu contraseña. Recibirás un correo electrónico confirmando dicho cambio.</p>';
                        final += '<p class="is-hidden-touch">Atte. Administración de <strong>' + forumData.name + '</strong>.</p>';
                        final += '</div>';
                        final += '</li>';
                        final += '</ul>';
                        final += '</section>';
                        final += '</form>';
                        final += '</section>';

                        [].forEach.call(document.querySelectorAll('#content-container > *:not(#forum-topbar)'), (item) => {
                            item.remove();
                        });

                        document.querySelector('#content-container').insertAdjacentHTML('beforeend', final);
                        document.querySelector('input[value="REINICIAR"]').value = 'Reiniciar';
                    } else {
                        getForumNotSupportedPage();
                    }
                    break;
            }
        } else if (window.location.pathname === '/profile.php') {
            document.querySelector('input[type="reset"]').removeAttribute('style');
            document.querySelector('input[value="Registrar"]').classList.add('btn-main');

            let final = '';

            final += '<section id="forum-content" class="is-not-vue">';
            final += '<div class="to-process">';
            final += '<div id="breadcrumbs">';
            final += '<a href="#">Recuperar contraseña</a>';
            final += '</div>';
            final += '</div>';
            final += '<form action="" method="post" id="login-section" class="basic-element">';
            final += '<section class="generic-element">';
            final += getForumHeader('Recuperar contraseña');
            final += '<ul class="columns is-vcentered is-multiline is-two-columns-page">';
            final += '<li id="bloque-login" class="column is-full-touch is-first">';
            final += '<ul class="forum-fieldlist is-horizontal no-style">';
            final += '<li class="field-element field-nombre-de-usuario">';
            final += '<div class="forum-field">';
            final += '<div class="field-name">Contraseña</div>';
            final += '<div class="field-content"><input type="password" id="password_reg" name="password" value="" size="25" maxlength="25"></div>';
            final += '</div>';
            final += '</li>';
            final += '<li class="field-element field-correo">';
            final += '<div class="forum-field">';
            final += '<div class="field-name">Confirmar contraseña</div>';
            final += '<div class="field-content"><input type="password" id="password_confirm" name="password_confirm" value="" size="25" maxlength="25"></div>';
            final += '</div>';
            final += '</li>';
            final += '</ul>';
            final += '<div id="usereply-comand">';
            final += document.querySelector('.submit-buttons').innerHTML;
            final += '</div>';
            final += '</li>';
            final += '<li id="bloque-info" class="column is-full-touch is-second">';
            final += '<div class="is-content">';
            final += '<h3 class="is-hidden-touch">¡Saludos!</h3>';
            final += '<hr class="is-hidden-touch"/>';
            final += '<p class="is-hidden-touch">' + forumData.desc + '</p>';
            final += '<p>Tras pulsar el botón «Registrar» (si las contraseñas coinciden) podrás entrar de nuevo al foro.</p>';
            final += '<p class="is-hidden-touch">Atte. Administración de <strong>' + forumData.name + '</strong>.</p>';
            final += '</div>';
            final += '</li>';
            final += '</ul>';
            final += '</section>';
            final += '</form>';
            final += '</section>';

            [].forEach.call(document.querySelectorAll('#content-container > *:not(#forum-topbar)'), (item) => {
                item.remove();
            });

            document.querySelector('#content-container').insertAdjacentHTML('beforeend', final);
        }
    }
});

/* Registro */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/register') {
        if (document.querySelector('form#ucp')) {
            let final = '';

            final += '<section id="forum-content" class="is-not-vue">';
            final += '<div class="to-process">';
            final += '<div id="breadcrumbs">';
            final += '<a href="#">Registro</a>';
            final += '</div>';
            final += '</div>';
            final += '<form action="" method="post" name="post" id="register-section" class="basic-element">';
            final += '<section class="generic-element">';
            final += getForumHeader('Registro');
            final += '<ul class="columns is-vcentered is-multiline is-two-columns-page">';
            final += '<li id="bloque-login" class="column is-full-touch is-first">';
            final += '<ul class="forum-fieldlist is-horizontal no-style">';
            final += '<li class="field-element field-nombre-de-usuario">';
            final += '<div class="forum-field">';
            final += '<div class="field-name">Nombre de usuario</div>';
            final += '<div class="field-content"><input type="text" id="username_reg" name="username" value="" size="25" maxlength="25"></div>';
            final += '</div>';
            final += '</li>';
            final += '<li class="field-element field-correo">';
            final += '<div class="forum-field">';
            final += '<div class="field-name">Correo electrónico</div>';
            final += '<div class="field-content"><input type="text" id="email" name="email" value="" size="25" maxlength="64"></div>';
            final += '</div>';
            final += '</li>';
            final += '<li class="field-element field-contrasena">';
            final += '<div class="forum-field">';
            final += '<div class="field-name">Contraseña</div>';
            final += '<div class="field-content"><input type="password" id="password_reg" name="password" value="" size="25" maxlength="25"></div>';
            final += '</div>';
            final += '</li>';
            final += '<li class="field-element mt-5">';
            final += '<div id="checkbox-wantnews" class="forum-checkbox">';
            final += '<div class="checkbox-content">';
            final += '<div class="checkbox-click">';
            final += '<i class="fas fa-check"></i>';
            final += '</div>';
            final += '<div class="checkbox-name">Acepto recibir noticias del foro</div>';
            final += '</div>';
            final += '<div class="checkbox-real">';
            final += '<input type="checkbox" id="wantsnews" name="wantsnews" value="1">';
            final += '</div>';
            final += '</div>';
            final += '</li>';
            final += '</ul>';
            final += '<div id="usereply-comand">';
            final += '<input type="submit" name="submit" value="Registrar" class="button2 btn-main">';
            final += '<input type="reset" name="reset" value="Reiniciar" class="button2">';
            final += '</div>';
            final += '</li>';
            final += '<li id="bloque-info" class="column is-full-touch is-second">';
            final += '<div class="is-content">';
            final += '<h3 class="is-hidden-touch">¡Saludos!</h3>';
            final += '<hr class="is-hidden-touch"/>';
            final += '<p class="is-hidden-touch">' + forumData.desc + '</p>';
            final += '<p>Recuerda, antes de proceder, echar un vistazo a nuestras <a href="' + forumConfig.usableDirections.norms + '" title="Ir a «Normativa»">normas</a> y <a href="' + forumConfig.usableDirections.lore + '" title="Ir a «Trasfondo»">trasfondo</a>.</p>';
            final += '<p class="is-hidden-touch">Atte. Administración de <strong>' + forumData.name + '</strong>.</p>';
            final += '</div>';
            final += '</li>';
            final += '</ul>';
            final += '</section>';
            final += '</form>';
            final += '</section>';

            if (document.querySelector('p[style="color: red;"]')) {
                console.log(document.querySelector('p[style="color: red;"]').textContent);
            }

            [].forEach.call(document.querySelectorAll('#content-container > *:not(#forum-topbar)'), (item) => {
                item.remove();
            });

            document.querySelector('#content-container').insertAdjacentHTML('beforeend', final);

            document.querySelector('#register-section').onsubmit = (event) => {
                let count = 0;

                document.querySelector('input[name="username"]').value = document.querySelector('input[name="username"]').value.replace(/"/g, () => {
                    count++;
                    return count % 2 === 0 ? '»' : '«';
                }).replace(/`/g, `'`).replace(/´/g, `'`);

                event;
            };
        } else if (document.querySelector('form#form_confirm')) {
            document.querySelector('input[value="Registrar"]').classList.add('btn-main');

            let final = '';

            final += '<section id="forum-content" class="is-not-vue">';
            final += '<div class="to-process">';
            final += '<div id="breadcrumbs">';
            final += '<a href="#">Registro</a>';
            final += '</div>';
            final += '</div>';
            final += '<form action="" method="post" name="form_confirm" id="register-section" class="basic-element">';
            final += '<section class="generic-element">';
            final += getForumHeader('Registro');
            final += '<ul class="columns is-vcentered is-multiline is-two-columns-page">';
            final += '<li id="bloque-login" class="column is-full-touch is-first">';
            final += '<ul class="forum-fieldlist is-horizontal no-style">';
            final += '<li class="field-element field-confirmar-contrasena">';
            final += '<div class="forum-field">';
            final += '<div class="field-name">Confirmar contraseña</div>';
            final += '<div class="field-content"><input type="password" name="password_confirm" maxlength="25"></div>';
            final += '</div>';
            final += '</li>';
            final += '<li class="field-element field-cloudflare mb-0">';
            final += document.querySelector('.fields2 > script').outerHTML;
            final += document.querySelector('.fields2 > .cf-turnstile').outerHTML;
            final += '</li>';
            final += '</ul>';
            final += '<div id="usereply-comand">';
            final += '<input type="hidden" name="username" value="">';
            final += '<input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response-3">';
            final += '<input type="hidden" name="submit" value="1">';
            final += document.querySelector('input[value="Registrar"]').parentElement.innerHTML;
            final += '</div>';
            final += '</li>';
            final += '<li id="bloque-info" class="column is-full-touch is-second">';
            final += '<div class="is-content">';
            final += '<h3 class="is-hidden-touch">¡Saludos!</h3>';
            final += '<hr class="is-hidden-touch"/>';
            final += '<p class="is-hidden-touch">' + forumData.desc + '</p>';
            final += '<p>Recuerda, antes de proceder, echar un vistazo a nuestras <a href="' + forumConfig.usableDirections.norms + '" title="Ir a «Normativa»">normas</a> y <a href="' + forumConfig.usableDirections.lore + '" title="Ir a «Trasfondo»">trasfondo</a>.</p>';
            final += '<p class="is-hidden-touch">Atte. Administración de <strong>' + forumData.name + '</strong>.</p>';
            final += '</div>';
            final += '</li>';
            final += '</ul>';
            final += '</section>';
            final += document.querySelector('#form_confirm script').outerHTML;
            final += '</form>';
            final += '</section>';

            [].forEach.call(document.querySelectorAll('#content-container > *:not(#forum-topbar)'), (item) => {
                item.remove();
            });

            document.querySelector('#content-container').insertAdjacentHTML('beforeend', final);
        }
    }
});

/* Aviso */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('p[style="text-align:center"]') && document.querySelector('p[style="text-align:center"]').textContent === 'Un nuevo mensaje ha sido añadido mientras escribías el tuyo. Puedes ver los últimos mensajes posteados abajo y decidir si quieres modificarlo o registrarlo.') {
        document.querySelector('form[action="/post"] .submit-buttons').remove();

        let final = '';

        final += '<section id="forum-content" class="is-not-vue">';
        final += '<div class="to-process">';
        final += '<div id="breadcrumbs">';
        final += '<a href="#">Informaciones</a>';
        final += '</div>';
        final += '</div>';
        final += '<form action="/post" method="post" name="post" id="message-section" class="basic-element">';
        final += '<section class="generic-element">';
        final += getForumHeader();
        final += '<div class="msg-element is-content">';
        final += '<p>Un nuevo mensaje ha sido añadido mientras escribías el tuyo. Puedes decidir si quieres modificarlo o registrarlo.</p>';
        final += '<p><u><strong>Recuerda, si procedes e ibas a hacer una tirada, esta no se hará.</strong></u></p>';
        final += '</div>';
        final += '<div id="usereply-comand">';
        final += document.querySelector('form[action="/post"]').innerHTML;
        final += '<input type="submit" name="prevent_post" value="Registrar" class="button1 btn-main">';
        final += '<input type="submit" name="prevent_modif" value="Modificar" class="button2">';
        final += '</div>';
        final += '</section>';
        final += '</form>';
        final += '</section>';

        [].forEach.call(document.querySelectorAll('#content-container > *:not(#forum-topbar)'), (item) => {
            item.remove();
        });

        document.querySelector('#content-container').insertAdjacentHTML('beforeend', final);
    }
});

/* Otras búsquedas */
document.addEventListener('DOMContentLoaded', () => {
    const pages = ['?search_id=draftsearch', '?search_id=watchsearch'];

    pages.forEach((page) => {
        if (window.location.search.indexOf(page) > -1) {
            getForumNotSupportedPage();
        }
    });
});

/* Otras páginas */
document.addEventListener('DOMContentLoaded', () => {
    const pages = ['/gallery', '/calendar', '/faq', '/contact', '/abuse', '/statistics', '/privacy', '/images', '/discover', '/search'];

    pages.forEach((page) => {
        if (window.location.pathname.indexOf(page) > -1) {
            getForumNotSupportedPage();
        }
    });
});

/* Mensajes */
/* Botones de moderación */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#mod-controls') && document.querySelector('#mod-controls').children.length > 0) {
        const returnHTML = () => {
            let html = '';

            /* INICIO */
            /* Poner el contenido del componente "boton-foro" adaptado a esta vista. */

            html += '<li class="btn-element btn-gestionar">';
            html += '<div class="dropdown is-dropeable is-right">';
            html += '<div class="dropdown-trigger">';
            html += '<a targer="_blank" title="Gestionar" class="forum-button is-pointer" aria-haspopup="true" aria-controls="dropdown-menu">';
            html += '<span class="icon"><i class="fas fa-wrench"></i></span>';
            html += '<span class="text is-hidden-touch">Gestionar</span>';
            html += '</a>';
            html += '</div>';
            html += '<div class="dropdown-menu" role="menu">';
            html += '<div class="dropdown-content">';

            [].forEach.call(document.querySelector('#mod-controls').children, (item) => {
                switch (item.querySelector('img')) {
                    case null:
                        const type = item.textContent.match(/Dejar/) ? 'Dejar de vigilar tema' : 'Vigilar tema';

                        html += '<a href="' + item.href + '" title="' + type + '" class="dropdown-item">' + type + '</a>';
                        break;

                    default:
                        html += '<a href="' + item.href + '" title="' + item.querySelector('img').title + '" class="dropdown-item">' + item.querySelector('img').title + '</a>';
                        break;
                }
            });

            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</li>';

            /* FIN */

            return html;
        };

        [].forEach.call(document.querySelectorAll('.page-buttons'), (item) => {
            item.insertAdjacentHTML('afterbegin', returnHTML());
        });
    }
});

/* Correcciones de enlace */
document.addEventListener('DOMContentLoaded', () => {
    const elements = [{
        url: `${window.location.origin}/search?search_id=draftsearch`,
        substitute: `${forumConfig.usableDirections.ucp}#/bosquejos`
    }, {
        url: `/search?search_id=draftsearch`,
        substitute: `${forumConfig.usableDirections.ucp}#/bosquejos`
    }, {
        url: `${window.location.origin}/search?search_id=topicdraftsearch`,
        substitute: `${forumConfig.usableDirections.ucp}#/bosquejos`
    }, {
        url: `/search?search_id=topicdraftsearch`,
        substitute: `${forumConfig.usableDirections.ucp}#/bosquejos`
    }];

    elements.forEach((element) => {
        const links = document.querySelectorAll(`a[href^="${element.url}"]`);

        [].forEach.call(links, (item) => {
            item.href = element.substitute;
        });
    });
});

/* Recaptcha */
document.addEventListener('forumReady', () => {
    if (document.querySelector('#g-recaptcha-response-3') && typeof captchaCheck !== 'undefined') {
        inputToken = document.querySelector('#g-recaptcha-response-3');
        inputToken.closest('form').addEventListener('submit', captchaCheck);
    }
});

/* JS del foro */
document.addEventListener('DOMContentLoaded', () => {
    const header = '<section id="forum-header">' + document.querySelector('#page-header').innerHTML + '</section>';
    const affiliates = '<section id="extracredits-section" class="basic-element">' + document.querySelector('#page-afiliates').innerHTML + '</section>';
    const footer = document.querySelector('#forum-footer').outerHTML;
    const breadcrumbs = document.querySelector('#forum-topbar .category-navegacion nav').outerHTML;

    document.querySelector('body>header').remove();
    document.querySelector('footer').remove();
    document.querySelector('#forum-footer').remove();
    document.querySelector('#forum-topbar .category-navegacion').remove();

    document.querySelector('#content-container').insertAdjacentHTML('afterbegin', header);
    document.querySelector('#content-container').insertAdjacentHTML('beforeend', footer);
    document.querySelector('#forum-topbar').insertAdjacentHTML('beforebegin', breadcrumbs);

    if (document.querySelector('#forum-content .basic-element')) {
        document.querySelector('#forum-content .basic-element').parentElement.insertAdjacentHTML('beforeend', affiliates);
    } else if (document.querySelector('#forum-wiki .basic-element')) {
        document.querySelector('#forum-wiki .basic-element').parentElement.insertAdjacentHTML('beforeend', affiliates);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.forum-forum')) {
        [].forEach.call(document.querySelectorAll('.forum-forum'), (item) => {
            if (item.querySelector('.forum-misc') && item.querySelector('.forum-box')) {
                item.querySelector('.forum-misc').insertAdjacentHTML('afterbegin', item.querySelector('.forum-box').outerHTML);
                item.querySelector('.forum-interior .forum-box').remove();
            }
        });
    }
});

document.addEventListener('forumReady', () => {
    if (document.querySelector('.forum-forum')) {
        [].forEach.call(document.querySelectorAll('.forum-forum'), (item) => {
            if (item.querySelector('.forum-last .is-hidden-desktop > strong')) {
                item.querySelector('.lastpost-name').insertAdjacentHTML('beforeend', item.querySelector('.forum-last .is-hidden-desktop > strong').outerHTML);

                if (item.querySelector('.lastpost-name > strong a')) {
                    const profileName = item.querySelector('.lastpost-name > strong a').innerHTML;
                    const profileLink = item.querySelector('.lastpost-name > strong').innerHTML.split(profileName);

                    item.querySelector('.lastpost-name > strong').innerHTML = profileName;
                    item.querySelector('.lastpost-user').outerHTML = `${profileLink[0]}${item.querySelector('.lastpost-user').innerHTML}${profileLink[1]}`;
                    item.querySelector('.is-one-third > a').classList.add('lastpost-user');
                }
            }

            if (item.querySelector('.forum-last .is-hidden-desktop .lastpost-link')) {
                const postLink = item.querySelector('.forum-last .is-hidden-desktop .lastpost-link').outerHTML;
                const postDate = item.querySelector('.forum-last .is-hidden-desktop').innerHTML.split('</strong>, ')[1];

                item.querySelector('.forum-last .is-hidden-touch').insertAdjacentHTML('beforeend', `${postLink}, ${postDate}`);
            }
        });
    }
});

document.addEventListener('forumReady', () => {
    if (document.querySelector('body') && forumConfig.skinOptions.monochromeImages) {
        document.querySelectorAll('body').classList.add('is-monochrome');
    }
});

document.addEventListener('forumReady', () => {
    if (window.location.pathname !== '/' && document.querySelector('#forum-topbar') && forumConfig.skinOptions.hideTopbar) {
        document.querySelector('#forum-topbar').remove();
    }
});