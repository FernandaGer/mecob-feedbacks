# MECOB Feedbacks — Deploy

## Passo a passo completo

### 1. Supabase — criar o banco

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **New project**
   - Nome: `mecob-feedbacks`
   - Senha do banco: anote em lugar seguro
   - Região: South America (São Paulo)
3. Aguarde o projeto iniciar (~2 min)
4. Vá em **SQL Editor** → **New query**
5. Cole o conteúdo do arquivo `supabase-schema.sql` e clique em **Run**
6. Vá em **Settings** → **API** e copie:
   - `Project URL` → vai virar `SUPABASE_URL`
   - `service_role` (secret) → vai virar `SUPABASE_SERVICE_KEY`

---

### 2. GitHub — subir o código

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **+** → **New repository**
   - Nome: `mecob-feedbacks`
   - Privado (Private) ✓
   - Clique em **Create repository**
3. Na sua máquina, abra o terminal nesta pasta e execute:

```bash
git init
git add .
git commit -m "primeiro deploy"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mecob-feedbacks.git
git push -u origin main
```

---

### 3. Vercel — hospedar

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Add New** → **Project**
3. Selecione o repositório `mecob-feedbacks`
4. Em **Environment Variables**, adicione:
   - `SUPABASE_URL` = (cole o Project URL do Supabase)
   - `SUPABASE_SERVICE_KEY` = (cole o service_role secret)
5. Clique em **Deploy**
6. Aguarde ~1 minuto — o Vercel vai gerar uma URL como `mecob-feedbacks.vercel.app`

---

### Pronto!

Acesse a URL gerada pelo Vercel. O painel vai carregar os dados do Supabase.
Para acessar de qualquer computador, basta abrir essa URL.

### Domínio personalizado (opcional)

No Vercel → seu projeto → **Settings** → **Domains**
→ adicione ex: `feedbacks.mecob.com.br`

