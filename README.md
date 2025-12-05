# SimpleMoney

Aplicativo web para gerenciamento financeiro pessoal, desenvolvido com React e Next.js.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Next.js 14** - Framework React com App Router
- **Tailwind CSS** - Framework CSS utilitário
- **Tanstack Query** - Gerenciamento de estado do servidor e cache
- **Zustand** - Gerenciamento de estado global leve e simples
- **Lucide React** - Biblioteca de ícones

## 📋 Requisitos Técnicos Implementados

✅ **Frontend:**
- React/Next.js com roteamento (Next.js App Router)
- CSS profissional com Tailwind CSS
- Tanstack Query para gerenciamento de dados
- Zustand para gerenciamento de estado global

## 🎨 Telas Implementadas

1. **Tela de Carregamento** (`/`) - Tela inicial com logo e animação
2. **Tela de Login** (`/login`) - Autenticação de usuários
3. **Tela de Registro** (`/register`) - Criação de nova conta
4. **Tela de Recuperação de Senha** (`/forgot-password`) - Recuperação de senha via email

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd Project-SimpleMoney
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse `http://localhost:3000` no navegador

## 📁 Estrutura do Projeto

```
simple_money/
├── app/                    # Rotas e páginas da aplicação (Next.js App Router)
│   ├── layout.jsx          # Layout raiz com Providers e Footer
│   ├── globals.css         # Estilos globais (Tailwind + custom)
│   ├── page.jsx            # Tela inicial (animação de loading)
│   ├── login/              # Autenticação de usuários
│   │   └── page.jsx
│   ├── register/           # Cadastro de novos usuários
│   │   └── page.jsx
│   ├── forgot-password/    # Recuperação de senha
│   │   └── page.jsx
│   ├── home/               # Dashboard principal do usuário
│   │   └── page.jsx
│   ├── profile/            # Perfil do usuário, contato e termos
│   │   ├── page.jsx
│   │   ├── contact/
│   │   │   └── page.jsx
│   │   └── terms/
│   │       └── page.jsx
│   ├── challenges/         # Página de desafios gamificados
│   │   └── page.jsx
│   ├── summary/            # Resumo financeiro e gráficos
│   │   └── page.jsx
│   ├── goals/              # Metas financeiras dos usuários
│   │   ├── add/
│   │   │   └── page.jsx
│   │   ├── [id]/           # Detalhe de meta por ID
│   │   │   └── page.jsx
│   │   └── page.jsx        # Lista de metas
│   ├── transactions/       # Listagem/adicionar transações
│   │   ├── add/
│   │   │   └── page.jsx
│   │   └── page.jsx
│   ├── providers.jsx       # Envolve a aplicação com TanStack Query e Theme
│   └── hooks/              # Hooks globais customizados
│       └── useAuthCheck.js
├── components/             # Componentes reutilizáveis UI/Layout
│   ├── layout/             # Header, Footer, Navigation, Modal
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   └── NotificationModal.jsx
│   ├── goals/              # Components das metas
│   │   ├── AddGoalForm.jsx
│   │   └── GoalCard.jsx
│   └── ui/                 # UI genérica (botão, input, cards, modal, seleção...)
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Checkbox.jsx
│       ├── CircularProgress.jsx
│       ├── ConfirmModal.jsx
│       ├── Input.jsx
│       ├── Select.jsx
│       └── SuccessModal.jsx
├── lib/                    # Lógicas e "stores" (Zustand: dashboard, goals, profile...)
│   ├── database.config.js  # Config de simulação de banco/Supabase
│   ├── goalsStore.js       # Store de metas
│   ├── soundManager.js     # Lógica de sons
│   ├── sounds.js           # Tabela/efeitos de sons
│   ├── store.js            # Estado global (auth, profile, dashboard, transações)
│   ├── supabase.js         # Helpers para integração Supabase
│   └── themeStore.js       # Store do tema (claro/escuro)
├── jsconfig.json           # Alias de paths
├── next.config.js          # Configuração Next.js
├── package.json            # Dependências e scripts
├── tailwind.config.js      # Configuração Tailwind CSS
```

- Rotas Next.js App Router estão em `app/`, organizadas por página ou recurso (ex: `/home`, `/goals`, `/transactions`, `/summary`, `/challenges`, `/profile`).
- Componentes globais ficam em `components/`.
- Estados globais e lógica de negócios (Zustand e serviços) em `lib/`.
- O design prioriza responsividade e boas práticas de UX/UI.

## 🎯 Funcionalidades

- ✅ Autenticação de usuários (simulada)
- ✅ Registro de novos usuários
- ✅ Recuperação de senha
- ✅ Design responsivo (Mobile e Desktop)
- ✅ Persistência de estado no localStorage
- ✅ Validação de formulários
- ✅ Feedback visual de carregamento

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 🔧 Configuração

O projeto utiliza:
- **Tailwind CSS** para estilização
- **Zustand** com persist middleware para estado global
- **Tanstack Query** para gerenciamento de dados do servidor
- **Next.js App Router** para roteamento

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# URL base da aplicação (usada para redirecionamentos OAuth)
# Para desenvolvimento local, use: http://localhost:3000
# Para produção, use a URL do seu domínio: https://seu-dominio.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Importante:** A variável `NEXT_PUBLIC_SITE_URL` é usada para configurar a URL de redirecionamento do OAuth (login com Google). Certifique-se de que:
1. Esta URL corresponde à URL onde sua aplicação está rodando
2. A mesma URL está configurada no painel do Supabase em **Authentication > URL Configuration > Redirect URLs**

## 📱 Responsividade

O projeto foi desenvolvido priorizando Desktop, mas é totalmente responsivo para dispositivos móveis, utilizando as classes do Tailwind CSS com breakpoints (`sm:`, `md:`, `lg:`).

## 🎨 Paleta de Cores

- **Primary (Roxo)**: `#9333ea` - Cor principal do SimpleMoney
- **Gray**: Tons de cinza para textos e backgrounds
- **White**: Backgrounds e elementos claros

## Integrantes  
- Levi Vitor
- Gabriel Taboza
- Luan Banderia
- Brenno Souza
- Alexis Gonçalves
- João Emanuel Melo Barbosa
  
## 📄 Licença

MIT License - veja o arquivo LICENSE para mais detalhes.

