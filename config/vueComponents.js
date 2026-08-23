/* Componentes del foro */
Vue.component('titulo-especial', {
    props: ['title'],
    computed: {
        cleanedTitle() {
            return FNR.utility.genSlug(this.title, ' ');
        }
    },
    template: `
    <h3 class="is-tweakeable"><span class="is-measurable" v-html="title"></span><small v-html="cleanedTitle"></small></h3>
    `
});

/* Estructura del foro */
Vue.component('cabecera-foro', {
    data() {
        return {
            title: this.$slots['title'][0].tag === undefined ? Vue.filter('mini-sanitize')(this.$slots['title'][0].text) : Vue.filter('mini-sanitize')(this.$slots['title'][0].children[0].text)
        }
    },
    computed: {
        cleanedTitle() {
            return FNR.utility.genSlug(this.title, ' ');
        }
    },
    template: `
    <div class="forum-head regular-head">
        <i class="fa-solid fa-caret-right"></i>
        <h3><span v-html="title"></span><small v-html="cleanedTitle"></small></h3>
    </div>
    `
});

Vue.component('cabcategoria-foro', {
    data() {
        return {
            title: this.$slots['title'][0].tag === undefined ? Vue.filter('mini-sanitize')(this.$slots['title'][0].text) : Vue.filter('mini-sanitize')(this.$slots['title'][0].children[0].text)
        }
    },
    computed: {
        cleanedTitle() {
            return FNR.utility.genSlug(this.title, ' ');
        }
    },
    template: `
    <div class="forum-head category-head">
        <i class="fa-solid fa-caret-right"></i>
        <h3><span v-html="title"></span><small v-html="cleanedTitle"></small></h3>
    </div>
    `
});

Vue.component('cabespecial-foro', {
    data() {
        return {
            title: this.$slots['title'][0].tag === undefined ? Vue.filter('mini-sanitize')(this.$slots['title'][0].text) : Vue.filter('mini-sanitize')(this.$slots['title'][0].children[0].text)
        }
    },
    computed: {
        cleanedTitle() {
            return FNR.utility.genSlug(this.title, ' ');
        }
    },
    template: `
    <div class="forum-head special-head">
        <i class="fa-solid fa-caret-right"></i>
        <h3><span v-html="title"></span><small v-html="cleanedTitle"></small></h3>
    </div>
    `
});

Vue.component('controles-foro', {
    data() {
        return {
            maPage: 0,
            userName: _userdata.username,
            userAvatar: _userdata.avatar.split('src="')[1].split('"')[0],
            userLevel: _userdata.user_level,
            userId: _userdata.user_id,
            userLog: _userdata.session_logged_in,
            userMP: 0,
            userOut: '',
            isActive: false,
            profileName: forumConfig.profileOptions.profileName || 'perfil'
        };
    },
    computed: {
        isActiveClass() {
            return 'has-bg' + ((this.isActive) ? ' visible' : ' not-visible');
        }
    },
    methods: {
        turnActive() {
            this.isActive = (this.isActive) ? false : true;
        }
    },
    created() {
        if (this.userLog !== 0) {
            if (document.querySelector('#i_icon_mini_new_message') !== null && document.querySelector('#i_icon_mini_new_message').title.match(/[0-255]/) !== null) {
                this.userMP = parseInt(document.querySelector('#i_icon_mini_new_message').title.match(/[0-255]/)[0]);
            }

            this.userOut = document.querySelector('#logout').href;
        }
    },
    template: `
    <div :class="'main-body' + (isActive ? ' is-on' : '')">        
        <div id="hmg-button" @click="turnActive()" class="is-pointer">
            <i class="fas fa-bars"></i>
        </div>
        <div class="top">
            <template v-if="userId !== -1">
                <a :href="'/u' + userId" :title="'Ir a tu ' + profileName" class="user">
                    <div class="user-avatar">
                        <img :src="userAvatar" :alt="'Avatar de ' + userName" />
                    </div>
                    <span>{{ userName | just-name }}</span>
                </a>
            </template>
            <template v-else>
                <a href="/" title="Ir a «Inicio»" class="user">
                    <span>Invitado</span>
                </a>
            </template>
            <div id="hmg-close">
                <i class="fas fa-times is-pointer" @click="turnActive()"></i>
            </div>
        </div>
        <nav class="bottom">   
            <navbar-foro :username="userName" :userlevel="userLevel" :userid="userId" :userlog="userLog" :usermp="userMP" :userout="userOut" />
            <section v-if="maPage === 1" id="multiaccount-transition">
                <cargando-foro text="Cambiando de cuenta…"></cargando-foro>
            </section>
        </nav>
    </div>
    `
});

Vue.component('navbar-foro', {
    props: ['username', 'userlevel', 'userid', 'userlog', 'usermp', 'userout'],
    data() {
        return {
            profileName: forumConfig.profileOptions.profileName || 'perfil',
            items: forumContent.navbar,
            navigation: forumContent.links,
            directions: forumConfig.usableDirections,
            multiAccount: {
                status: false,
                position: -1,
                accounts: []
            }
        }
    },
    computed: {
        isStatusClass() {
            return ((this.userlog === 1) ? 'is-logged' : 'is-unlogged') + ((this.userlevel === 1) ? ' is-admin' : ' is-user')
        },
        mpText() {
            return this.usermp !== 0 ? 'Tienes ' + this.usermp + ' mensaje' + (this.usermp === 1 ? '' : 's') + ' pendientes' : 'Ir a tu mensajería privada';
        },
        links() {
            return this.navigation.filter((item) => {
                return item.icon !== undefined;
            });
        }
    },
    methods: {
        changeAccount() {
            this.$parent.maPage = 1;

            FNR.user.changeAccount(this.userout, this.multiAccount.accounts[this.multiAccount.position].name, this.multiAccount.accounts[this.multiAccount.position].password).then((r) => {
                if (r) {
                    window.location.reload();
                }
            });
        }
    },
    created() {
        this.multiAccount.status = FNR.cache.getData('usermultiaccounts') !== false && FNR.cache.getData('userpassword') !== false && FNR.cache.getData('usermultiaccounts').length > 1;
        this.multiAccount.accounts = (FNR.cache.getData('usermultiaccounts') === false ? [] : FNR.cache.getData('usermultiaccounts').map((item) => {
            return {
                name: item.name,
                password: sjcl.decrypt(FNR.cache.getData('userpassword'), item.password)
            }
        })).filter((item) => {
            return item.name !== _userdata.username;
        }).sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });
    },
    template: `
    <ul :class="isStatusClass">
        <li class="navbar-item is-hidden-desktop" v-for="link in links">
            <a :href="link.url" :title="'Ir a «' + link.name + '»'">
                <div class="icon">
                    <i :class="link.icon"></i>
                </div>
                <div class="text">{{ link.name }}</div>
            </a>
        </li>
        <li class="navbar-item" v-for="item in items">
            <a :href="item.url" :title="'Ir a «' + item.name + '»'">
                <div class="icon">
                    <i :class="item.icon"></i>
                </div>
                <div class="text">{{ item.name }}</div>
            </a>
        </li>
        <template v-if="!userlog">
            <li class="navbar-item">
                <a href="/register" title="Registrarse en el foro">
                    <div class="icon">
                        <i class="fa-solid fa-user-plus"></i>
                    </div>
                    <div class="text">Registrarse</div>
                </a>
            </li>
            <li class="navbar-item">
                <a href="/login" title="Iniciar sesión en el foro">
                    <div class="icon">
                        <i class="fa-solid fa-sign-in-alt"></i>
                    </div>
                    <div class="text">Conectarse</div>
                </a>
            </li>
        </template>
        <template v-else>
            <li class="navbar-item is-hidden-desktop">
                <a :href="'/u' + userid" :title="'Ir a tu ' + profileName">
                    <div class="icon">
                        <i class="fa-solid fa-id-card"></i>
                    </div>
                    <div class="text">Perfil</div>
                </a>
            </li>
            <li class="navbar-item">
                <a href="/search?search_id=egosearch" title="Ir a tus temas personales">
                    <div class="icon">
                        <i class="fa-solid fa-archive"></i>
                    </div>
                    <div class="text">Temas</div>
                </a>
            </li>
            <li class="navbar-item">
                <a href="/privmsg?folder=inbox" :title="mpText">
                    <div class="icon">
                        <template v-if="usermp === 0">
                            <i class="fa-solid fa-envelope"></i>
                        </template>
                        <template v-else>
                            <i class="fa-solid fa-message-exclamation"></i>
                        </template>
                    </div>
                    <div class="text">Mensajería</div>
                </a>
            </li>
            <li class="navbar-item">
                <a :href="directions.ucp" title="Ir al «Panel de Usuario»">
                    <div class="icon">
                        <i class="fa-solid fa-sliders-h"></i>
                    </div>
                    <div class="text">Editar</div>
                </a>
            </li>
            <template v-if="multiAccount.status">
                <li class="navbar-item">
                    <select title="Cambiar de cuenta" v-model="multiAccount.position" @change="changeAccount()" @click="$event.stopPropagation()">
                        <option value="-1" hidden selected>Selec. personaje</option>
                        <option v-for="(account, index) in multiAccount.accounts" :value="index">{{ account.name }}</option>
                    </select>
                    <a :href="directions.ucp" title="Ir al «Panel de Usuario»">
                        <div class="icon">
                            <i class="fa-solid fa-address-book"></i>
                        </div>
                        <div class="text">Cuentas</div>
                    </a>
                </li>
            </template>
            <template v-if="userlevel === 1">
                <li class="navbar-item">
                    <a href="/admin" title="Ir al «Panel de Administrador»">
                        <div class="icon">
                            <i class="fa-solid fa-cogs"></i>
                        </div>
                        <div class="text">Administrar</div>
                    </a>
                </li>
            </template>
            <li class="navbar-item">
                <a :href="userout" title="Cerrar sesión">
                    <div class="icon">
                        <i class="fa-solid fa-sign-out-alt"></i>
                    </div>
                    <div class="text">Salir</div>
                </a>
            </li>
        </template>
    </ul>
    `
});

Vue.component('header-foro', {
    props: ['sitename'],
    data() {
        return {
            name: forumData.name,
            image: forumDefaults.logo
        }
    },
    template: `
    <section id="page-header" class="main-body">
        <a href="/" :title="'Ir al índice de «' + sitename + '»'" id="forum-logo">
            <template v-if="image">
                <img :src="image" :alt="name" />
            </template>
            <template v-else>
                <slot name="logo"></slot>
            </template>
        </a>
    </section>
    `
});

Vue.component('foro-foro', {
    props: ['url', 'name', 'posts', 'topics', 'lasturl'],
    data() {
        return {
            lastname: this.$slots['last-name'] === undefined ? '' : this.$slots['last-name'][0].text
        }
    },
    mounted() {
        const isForum = this.url.match(/f(\d+)-/) !== null;
        const prefix = isForum ? 'forum' : 'category';
        const classList = this.$el.parentElement.classList;
        const forumName = FNR.utility.genSlug(this.name, '-');
        const forumId = isForum ? this.url.match(/f(\d+)-/)[1] : this.url.match(/c(\d+)-/)[1];

        classList.add(`${prefix}-element`);
        classList.add(`${prefix}-${forumId}`);
        classList.add(`${prefix}-${forumName}`);
    },
    template: `
    <section class="forum-forum">
        <a class="forum-header" :href="url" :title="'Ir al subforo «' + name + '»'">
            <div class="forum-title is-tweakeable">
                <span class="is-measurable">{{ name }}</span>
            </div>
            <div class="forum-stats">{{ posts }} mensajes — {{ topics }} temas</div>
        </a>
        <div class="forum-content">
            <ul class="columns is-gapless is-multiline">
                <li class="column is-full is-half-desktop">
                    <div class="forum-info">
                        <ul class="columns is-gapless is-multiline">
                            <li class="column is-full is-two-thirds-desktop">
                                <div class="forum-misc">
                                    <div class="forum-last">
                                        <template v-if="lasturl.length">
                                            <div class="lastpost-content">
                                                <div class="is-hidden-desktop">
                                                    <a :href="lasturl" :title="'Último mensaje en el tema «' + lastname + '» por '" class="lastpost-link">{{ lastname }}</a> por <slot name="last-who"></slot>, <slot name="last-date"></slot>
                                                </div>
                                                <div class="is-hidden-touch"></div>
                                            </div>
                                        </template>
                                        <template v-else>Este subforo no tiene mensajes</template>
                                    </div>
                                </div>
                            </li>
                            <li class="column is-one-third is-hidden-touch">
                                <div class="lastpost-user">
                                    <div class="lastpost-avatar">
                                        <slot name="last-avatar"></slot>
                                    </div>
                                    <div class="lastpost-name"></div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li>
                <li class="column is-full is-half-desktop">
                    <div class="forum-interior">
                        <slot name="desc"></slot>
                    </div>
                </li>
            </ul>
        </div>
    </section>
    `
});

Vue.component('temas-foro', {
    props: ['type', 'url', 'replies', 'views', 'quick', 'lastpost', 'mode'],
    data() {
        return {
            title: this.$slots['title'][0].tag === undefined ? this.$slots['title'][0].text : this.$slots['title'][0].children[0].text
        }
    },
    computed: {
        currentMode() {
            const mode = typeof forumConfig.skinOptions.showTopicType === 'undefined' ? false : forumConfig.skinOptions.showTopicType;

            if (this.mode.indexOf('<strong>') > -1 && mode) {
                return this.mode.split('<strong>')[1].split(':</strong>')[0];
            } else {
                return '';
            }
        },
        currentType() {
            let type = this.type;

            if (window.location.pathname.indexOf('/merge') > -1) {
                type = 'radio';
            } else if (window.location.pathname.indexOf('/modcp') > -1) {
                type = 'checkbox';
            }

            return type;
        },
        currentClass() {
            const translate = {
                mp: 'mp',
                draft: 'draft',
                radio: 'mp',
                checkbox: 'mp',
                followed: 'mp'
            };

            return 'topiclist-topic' + (this.currentType !== 'normal' ? ' topic-' + translate[this.currentType] : '');
        }
    },
    mounted() {
        const list = ['checkbox', 'radio'];

        const classList = this.$el.parentElement.classList;

        if (this.currentType !== 'normal') {
            classList.add('is-not-lastpost');
        }

        if (list.indexOf(this.currentType) > -1) {
            classList.add('is-mod');
        }
    },
    template: `
    <div :class="currentClass">
        <template v-if="currentType === 'draft'">
            <div class="topic-main">
                <div class="topic-icon"></div>
                <div class="topic-container">
                    <span class="topic-title">
                        <a :href="url" :title="'Ir al tema «' + title + '»'">{{ title }}</a>
                    </span>
                    <div class="topic-extra">
                        <div class="topic-repliesandviews">
                            {{ replies }} - {{ views }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="topic-quicklink">
                <a class="topic-lastpost" :href="quick" :title="'Ir al bosquejo «' + title + '»'">
                    <i class="fas fa-pencil-alt"></i>
                </a>
            </div>
        </template>
        <template v-else-if="currentType === 'followed'">
            <div class="topic-main">
                <div class="topic-icon"></div>
                <div class="topic-container">
                    <span class="topic-title">
                        <a :href="url" :title="'Ir al tema «' + title + '»'">{{ title }}</a>
                    </span>
                    <div class="topic-extra">
                        <div class="topic-repliesandviews">
                            {{ replies }} - {{ views }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="topic-quicklink">
                <div class="topic-lastpost" title="¡Seleccióname!">
                    <slot name="radio"></slot>
                </div>
            </div>
        </template>
        <template v-else-if="currentType === 'mp'">
            <div class="topic-main">
                <div class="topic-icon"></div>
                <div class="topic-container">
                    <span class="topic-title">
                        <a :href="url" :title="'Ir al mensaje privado «' + title + '»'">{{ title }}</a>
                    </span>
                    <div class="topic-extra">
                        <div class="topic-pagination">{{ views }}</div>
                        <div class="topic-extra-separador">-</div>
                        <div class="topic-author">Por <slot name="who"></slot></div>
                    </div>
                </div>
            </div>
            <div class="topic-quicklink">
                <div class="topic-lastpost" title="¡Seleccióname!">
                    <div class="forum-checkbox">
                        <div class="checkbox-content">
                            <div class="checkbox-click">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                        <div class="checkbox-real"><slot name="checkbox"></slot></div>
                    </div>
                </div>
            </div>
            <div class="to-process">
                <slot name="status"></slot>
            </div>
        </template>
        <template v-else-if="currentType === 'radio'">
            <div class="topic-main">
                <div class="topic-icon"></div>
                <div class="topic-container">
                    <span class="topic-title">
                        <a :href="url" :title="'Ir al tema «' + title + '»'">{{ title }}</a>
                    </span>
                    <div class="topic-extra">
                        <div class="topic-author">Por <slot name="topic-author"></slot></div>
                        <div class="topic-repliesandviews">
                            {{ replies }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="topic-quicklink">
                <div class="topic-lastpost" title="¡Seleccióname!">
                    <div class="forum-checkbox">
                        <div class="checkbox-content">
                            <div class="checkbox-click">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                        <div class="checkbox-real"><slot name="checkbox"></slot></div>
                    </div>
                </div>
            </div>
            <div class="to-process">
                <slot name="status"></slot>
            </div>
        </template>
        <template v-else-if="currentType === 'checkbox'">
            <div class="topic-main">
                <div class="topic-icon"></div>
                <div class="topic-container">
                    <span class="topic-title">
                        <a :href="url" :title="'Separar tema «' + title + '»'">{{ title }}</a>
                    </span>
                    <div class="topic-extra">
                        <div class="topic-author">{{ lastpost }}</div>
                        <div class="topic-repliesandviews">
                            {{ replies }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="topic-quicklink">
                <div class="topic-lastpost" title="¡Seleccióname!">
                    <div class="forum-checkbox">
                        <div class="checkbox-content">
                            <div class="checkbox-click">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                        <div class="checkbox-real"><slot name="checkbox"></slot></div>
                    </div>
                </div>
            </div>
            <div class="to-process">
                <slot name="status"></slot>
            </div>
        </template>
        <template v-else>
            <div class="topic-main">
                <div class="topic-icon"></div>
                <div class="topic-container">
                    <span class="topic-title">
                        <a :href="url" :title="'Ir al tema «' + title + '»'"><template v-if="currentMode.length">{{ currentMode }}: </template>{{ title }}</a>
                    </span>
                    <div class="topic-extra">
                        <div class="topic-pagination to-process">Páginas: <slot name="pagination"></slot></div>
                        <div class="topic-extra-separador">-</div>
                        <div class="topic-author">Por <slot name="topic-author"></slot></div>
                        <div class="topic-repliesandviews">
                            {{ replies }} - {{ views }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="topic-quicklink">
                <slot name="last-avatar"></slot>
                <div class="topic-last">
                    <a class="topic-lastpost">
                        <i class="fas fa-link"></i> Último mensaje
                    </a>
                    Por <span class="topic-lastauthor"></span>
                    <br />
                    <span class="topic-lastdate"></span>
                </div>
            </div>
            <div class="to-process">
                <slot name="status"></slot>
                <slot name="last-post"></slot>
            </div>
        </template>
      </div>
      `
});

Vue.component('mensaje-foro', {
    props: ['id', 'online', 'edited', 'date'],
    computed: {
        slugId() {
            return 'post-' + this.id;
        },
        currentClass() {
            return 'postlist-post' + this.online;
        },
        currentDate() {
            const getDate = (txt) => {
                return txt.split('el ')[1];
            };

            if (this.date.length) return (this.date.indexOf('el') > -1 ? getDate(this.date).trim() : this.date.trim()) + ((this.edited.length && this.edited.indexOf('not-show') === -1) ? ' <a title="' + (this.edited.split('<br /><br />')[1].split(',')[0]) + '">Editado</a> ' : '');
            else return '';
        }
    },
    template: `
    <section :id="slugId" :class="currentClass">
        <a :id="id" class="page-anchor" />
        <div class="post-header">
            <div class="header-side"></div>
        </div>
        <div class="post-content">
            <div class="post-info">
                <div class="post-side">
                    <a :href="'#' + id" title="Enlace permanente" class="post-permalink">
                        <i class="fas fa-link"></i>
                    </a>
                    <div class="post-title" v-html="currentDate" v-if="currentDate.length"></div>
                </div>
                <ul class="post-buttons"></ul>
            </div>
            <div class="is-content">
                <slot name="content"></slot>
            </div>
        </div>
        <div class="post-profile">
            <slot name="profile"></slot>
        </div>
    </section>
    `
});

Vue.component('memberitem-foro', {
    props: ['profile', 'type'],
    data() {
        return {
            configType: this.profile === 'none' ? false : true,
            configName: forumConfig.profileOptions.profileName || 'perfil',
            configRank: forumConfig.profileOptions.profileRank,
            url: '/',
            title: `Ir al índice de «${forumData.name}»`,
            mp: '/',
            name: 'Usuario',
            avatar: forumDefaults.avatar,
            alt: 'Avatar por defecto',
            rank: 'Miembro',
            group: 'usergroup-unknown',
            messages: 0,
            lastvisit: 'Cargando…',
            currentlyLooking: ''
        }
    },
    created() {
        if (this.$slots['name']) {
            if (this.$slots['name'][0].text) {
                this.name = this.$slots['name'][0].text;
            } else {
                this.name = this.$slots['name'][0].children[0].children[0].text || 'Buscador';
            }
        }

        if (this.$slots['avatar']) {
            this.avatar = this.$slots['avatar'][0].data.attrs.src;
        }

        if (this.$slots['posts']) {
            this.messages = this.$slots['posts'][0].text;
        }

        if (this.$slots['last']) {
            this.lastvisit = this.$slots['last'][0].text;
        }

        if (this.$slots['site']) {
            this.currentlyLooking = this.$slots['site'][0].children[0].text;
        }

        if (this.configType) {
            FNR.user.getProfile(this.profile.split('/u')[1], .25).then((data) => {
                this.url = data.links.profile;
                this.title = `Ir al ${this.configName} de «${data.name}»`;
                this.mp = data.links.mp;
                this.alt = `Avatar de «${data.name}»`;
                this.rank = data.fields[this.configRank].content;
                this.group = 'usergroup-' + data.colour;

                if (!this.$slots['name']) {
                    this.name = data.name;
                }

                if (!this.$slots['avatar']) {
                    this.avatar = data.avatar;
                }

                if (!this.$slots['posts']) {
                    this.messages = data.messages.public;
                }

                if (!this.$slots['last']) {
                    this.lastvisit = data.lastvisit;
                }
            });
        }
    },
    template: `
    <a :class="'memberitem-element ' + group" :href="url" :title="title">
        <div class="memberlist-name">
            <h3 class="is-tweakeable">
                <span class="is-measurable">{{ name }}</span>
            </h3>
            <div v-if="type === 'memberlist'" class="is-tweakeable">
                <span class="is-measurable">{{ currentlyLooking ? currentlyLooking : lastvisit }}</span>
            </div>
        </div>
        <img class="memberlist-avatar" :src="avatar" :alt="alt" />
    </a>
    `
});

Vue.component('estadisticas-foro', {
    props: ['msg', 'users'],
    data() {
        return {
            lastTopics: [],
            userLog: _userdata.session_logged_in
        }
    },
    created() {
        FNR.forum.getTopics(forumConfig.skinOptions.excludedForums, forumConfig.skinOptions.lastTopics).then((r) => {
            this.lastTopics = r;
        });
    },
    template: `
    <ul class="columns is-multiline is-gapless">
        <li id="bloque-estadisticas" class="column is-one-third is-full-touch">
            <div id="new-connected">
                <h6>Ahora</h6>
                <div class="has-users">
                    <span class="curconnected-users"></span>
                </div>
            </div>
            <div id="past-connected">
                <h6>Últimas <span class="lastconnected-hour"></span> horas</h6>
                <div class="has-users">
                    <span class="lastconnected-users"></span>
                </div>
            </div>
        </li>
        <li id="bloque-grupos" class="column is-two-thirds is-full-touch">
            <div id="image-banner"></div>
            <ul id="census"></ul>
        </li>
        <li id="bloque-ultimostemas" class="column is-full">
            <h6>Últimos temas</h6>
            <ul class="ltopic-list">
                <li v-for="topic in lastTopics">
                    <tema-ref :info="topic"></tema-ref>
                </li>
            </ul>
            <small>También tienes la lista <a href="/latest" title="Ir a la página de «Últimos temas»">general</a><template v-if="userLog !== 0"> o desde tu <a href="/search?search_id=newposts" title="Ir a la página de «Desde última conexión»">ultima conexión</a></template>.</small>
        </li>
  	</ul>
    `
});

Vue.component('tema-ref', {
    props: ['info'],
    data() {
        return {
            profileName: forumConfig.profileOptions.profileName || 'perfil'
        }
    },
    computed: {
        userColor() {
            return 'color: ' + this.info.lastpost.who.color;
        }
    },
    template: `
    <div class="ltopic-element">
        <a class="ltopic-last" :href="info.lastpost.url" :title="'Ir al último mensaje del tema «' + info.name + '»'">
            <i class="fas fa-link"></i>
        </a>
        <a class="ltopic-title" :href="info.url" :title="'Ir al tema «' + info.name + '»'"><span>{{ info.name }}</span></a>
        <small class="ltopic-info"><a :href="info.lastpost.who.url" :style="userColor" :title="'Ir al ' + profileName + ' de «' + info.lastpost.who.name + '»'">{{ info.lastpost.who.name | just-name }}</a>, {{ info.lastpost.date }} en <a :href="info.forum.url" :title="'Ir al subforo «' + info.forum.name + '»'">{{ info.forum.name }}</a></small>
    </div>
    `
});

Vue.component('footer-foro', {
    data() {
        return {
            afis: {},
            normal: forumConfig.usableDirections.normal,
            credits: forumCredits.paragraphs,
            social: forumCredits.social
        }
    },
    created() {
        FNR.forum.getAffiliates().then((data) => {
            this.afis = data;
        });
    },
    template: `
    <section id="page-afiliates" class="main-body">
        <categoria-foro id="afiliados">
            <div class="forum-head category-head">
                <i class="fa-solid fa-caret-right"></i>
                <h3><span>Afiliados <span class="extra">+</span> Créditos</span><small>afiliados <span class="extra">+</span> creditos</small></h3>
            </div>
            <ul class="columns is-gapless">
                <li id="forum-affiliates" class="column is-two-thirds is-full-touch">
                    <ul class="columns is-gapless is-multiline">
                        <li id="forum-affiliates-sisters" class="column is-full affiliates-collection">
                            <h3 class="section-title">Hermanas</h3>
                            <ul v-html="afis.sister" class="no-style"></ul>
                        </li>
                        <li id="forum-affiliates-elite" class="column is-full">
                            <ul class="columns is-gapless is-multiline">
                                <li class="column is-two-thirds is-full-touch affiliates-collection">
                                    <h3 class="section-title">Élite</h3>
                                    <ul v-html="afis.elite" class="no-style"></ul>
                                </li>
                                <li class="column is-one-third is-full-touch affiliates-collection">
                                    <h3 class="section-title">Directorios</h3>
                                    <ul v-html="afis.directory" class="no-style"></ul>
                                </li>
                            </ul>
                        </li>
                        <li id="forum-affiliates-regular" class="column is-full" v-if="normal.length">
                            <h3 class="section-title"><a :href="normal" title="Ir a «Afiliaciones Normales»"><i class="fas fa-link"></i> Normales</a></h3>
                        </li>
                    </ul>
                </li>
                <li id="forum-cred" class="column is-full-touch">
                    <div class="is-content">
                        <h3 class="section-title">Créditos</h3>
                        <ul class="no-style">
                            <li v-for="credit in credits" v-html="credit"></li>
                            <li class="is-hidden-mobile">El diseño y programación de la skin <a target="_blank" href="https://darktimes-skin.foroactivo.com/" title="Ir al sitio web de «Dark Times»">Dark Times</a> por <a target="_blank" href="https://dykeporg.tumblr.com/" title="Ir al sitio web de «Gaylien»">Gaylien</a>. Agradecimiento especial a los equipos desarrolladores de <a target="_blank" href="https://vuejs.org/" title="Ir al sitio web de «Vue»">Vue</a> y <a target="_blank" href="https://bulma.io/" title="Ir al sitio web de «Bulma»">Bulma</a> por sus respectivos <em>Frameworks</em>.</li>
                            <li id="credits-social" v-if="social.length">
                                <ul class="no-style">
                                    <li v-for="platform in social">
                                        <a target="_blank" :href="platform.url" :title="'Ir a «' + platform.name + '»'"><em :class="platform.icon"></em> {{ platform.name }}</a>
                                    </li>
                                </ul>
                            </li>                                                                                          
                        </ul>
                    </div>
                </li>
            </ul>
        </categoria-foro>
    </section>
    `
});

/* Topbar */
Vue.component('tablon-titulo', {
    props: ['title'],
    template: `
    <h4 class="plank-title">
        <i class="fa-solid fa-caret-right"></i><span v-html="title"></span>
    </h4>
    `
});

Vue.component('tablon-superior', {
    data() {
        return {
            name: forumData.name,
        }
    },
    template: `
    <section id="topbar-section" class="basic-element">
        <categoria-foro id="tablon">
            <ul class="columns is-gapless is-multiline">
                <li class="column is-full">
                    <div id="plank-anmt" class="plank-block">
                        <tablon-titulo title="Anuncios <span class='extra'>+</span> Novedades"></tablon-titulo>
                        <links-anuncios></links-anuncios>
                    </div>
                </li>
                <li class="column is-full is-two-thirds-desktop">
                    <ul class="columns is-gapless is-multiline">
                        <li class="column is-full">
                            <div id="plank-staff" class="plank-block">
                                <tablon-titulo title="Administración"></tablon-titulo>
                                <links-staff></links-staff>
                            </div>
                        </li>
                        <li class="column is-half">
                            <div id="plank-search" class="plank-block">
                                <tablon-titulo title="Búsquedas"></tablon-titulo>
                                <busquedas></busquedas>
                            </div>
                        </li>
                        <li class="column is-half">
                            <div id="plank-sq" class="plank-block">
                                <tablon-titulo title="¿Sabías qué?"></tablon-titulo>
                                <sabias-que></sabias-que>
                            </div>
                        </li>
                    </ul>
                </li>
                <li class="column is-full is-one-third-desktop">
                    <div id="plank-help" class="plank-block">
                        <tablon-titulo title="Ayuda"></tablon-titulo>
                        <links-ayuda></links-ayuda>
                    </div>
                </li>
            </ul>
        </categoria-foro>
        <categoria-foro id="navegacion">
            <ul class="columns is-gapless is-multiline">
                <li class="column">
                    <nav id="forum-breadcrumb" class="breadcrumb has-succeeds-separator left" aria-label="breadcrumbs">
                        <ul>
                            <li>
                                <a href="/" title="Ir a «Inicio»">{{ name }}</a>
                            </li>
                        </ul>
                    </nav>
                </li>
            </ul>
        </categoria-foro>
    </section>
    `
});

Vue.component('links-ayuda', {
    data() {
        return {
            links: forumContent.links
        }
    },
    template: `
    <div id="help-main">
        <a :href="link.url" :title="'Ir a «' + link.name + '»'" v-for="link in links">{{ link.name }}</a>
    </div>
    `
});

Vue.component('links-anuncios', {
    data() {
        return {
            announcements: forumContent.announcements.list
        }
    },
    template: `
    <ul class="columns is-multiline">
        <li v-for="announcement in announcements" class="column is-one-quarter is-half-tablet is-half-mobile">
            <a :href="announcement.url" :title="'Ir al anuncio «' + announcement.name + '»'" class="anmt-element">
                <span class="anmt-title">{{ announcement.name }}</span>
                <span class="anmt-date">{{ announcement.date }}</span>
            </a>
        </li>
    </ul>
    `
});

Vue.component('sabias-que', {
    data() {
        return {
            content: forumContent.sq[Math.floor(Math.random() * forumContent.sq.length)]
        }
    },
    created() {
        setInterval(() => {
            this.content = forumContent.sq[Math.floor(Math.random() * forumContent.sq.length)];
        }, 12000);
    },
    template: `
    <div id="sq-img" class="msg-element topbar-element" :style="'background-image: url(' + content + ')'"></div>
    `
});

Vue.component('busquedas', {
    data() {
        return {
            content: forumContent.searches[Math.floor(Math.random() * forumContent.searches.length)]
        }
    },
    created() {
        setInterval(() => {
            this.content = forumContent.searches[Math.floor(Math.random() * forumContent.searches.length)];
        }, 16000);
    },
    template: `
    <a id="search-img" class="msg-element topbar-element" :style="'background-image: url(' + content.img + ')'" :href="content.url" :title="content.desc"></a>
    `
});