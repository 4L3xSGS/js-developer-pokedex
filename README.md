<div align="center">

<img src="./assets/icon.svg" width="64" alt="Pokédex Lex">

# Pokédex Lex

### Explore. Descubra. Compare.

Uma experiência de exploração Pokémon com identidade visual própria, filtros combináveis e comparação de atributos.

[![Quality](https://github.com/4L3xSGS/js-developer-pokedex/actions/workflows/quality.yml/badge.svg)](https://github.com/4L3xSGS/js-developer-pokedex/actions/workflows/quality.yml)
![JavaScript ES Modules](https://img.shields.io/badge/JavaScript-ES_Modules-b9f76b?style=flat-square&logo=javascript&logoColor=101511)
![Zero runtime dependencies](https://img.shields.io/badge/runtime-zero_dependencies-101511?style=flat-square)

[Funcionalidades](#funcionalidades) · [Executar](#executar-localmente) · [Arquitetura](#decisões-de-engenharia) · [Qualidade](#qualidade)

</div>

## O projeto

Evolução de um exercício de consumo de API para uma aplicação de portfólio. A proposta é demonstrar domínio de fundamentos web, experiência do usuário e decisões de engenharia proporcionais ao problema.

**Autor da evolução:** [Alexander Souto](https://github.com/4L3xSGS).

## Funcionalidades

- Índice das 1.025 espécies das nove gerações, consultado na PokéAPI.
- Busca por trecho do nome ou número, incluindo `#25`.
- Filtros por tipo e geração, combinados com favoritos e ordenação.
- Favoritos persistidos no navegador; tema claro/escuro com preferência salva.
- Comparação de duas ou três criaturas: seis atributos e soma dos atributos base.
- Fichas com tipos, habilidades, peso em kg e altura em metros.
- Links diretos: `pokemon.html?name=charizard`; endereço antigo preservado.
- Interface responsiva, navegação por teclado, foco visível e respeito a movimento reduzido.
- Estados de carregamento, coleção vazia e erro com tentativa de recuperação.

## Executar localmente

Requisitos: Node.js 22+ para verificações; Python 3 para o servidor de desenvolvimento incluído.

```bash
git clone https://github.com/4L3xSGS/js-developer-pokedex.git
cd js-developer-pokedex
npm start
```

Abra **http://localhost:4173**. Para utilizar as funcionalidades, mantenha JavaScript habilitado e conexão com a internet. Não abra o HTML diretamente via `file://`: o aplicativo usa módulos ES.

```bash
npm run check
npm test
```

Não é necessário instalar dependências para executar a aplicação ou os testes unitários.

## Decisões de engenharia

| Decisão                                          | Motivo                                                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| HTML semântico, CSS e módulos JavaScript nativos | Aplicação estática leve, sem etapa obrigatória de build e sem dependências de produção.                                                    |
| Um índice para busca local                       | Busca e ordenação não exigem uma requisição por tecla. A listagem não faz 24 chamadas adicionais para desenhar 24 cartões.                 |
| Filtros por tipo sob demanda                     | Informações detalhadas são buscadas apenas quando necessárias. Os cartões exibem nome e número; tipos aparecem nas fichas e na comparação. |
| Cache em memória e deduplicação de promises      | Reutiliza respostas e requisições simultâneas. Erros são removidos do cache para permitir nova tentativa.                                  |
| Timeout e controle de respostas fora de ordem    | Evita espera indefinida e impede que uma resposta antiga substitua filtros mais recentes.                                                  |
| Paginação em lotes de 24 e imagens lazy          | Reduz o DOM e o carregamento inicial de imagens da coleção.                                                                                |
| `dialog` nativo                                  | Foco modal e fechamento por Escape fornecidos pelo navegador.                                                                              |
| Persistência local com fallback                  | Falhas ou bloqueio de armazenamento não impedem a exploração.                                                                              |

```text
index.html                 Interface e pontos de entrada
assets/css/app.css         Tokens, temas, layout e responsividade
assets/js/main.js          Estado, eventos e renderização
assets/js/poke-api.js      API, cache e regras puras de seleção
pokemon.html               Compatibilidade com links antigos
tests/pokedex.test.js       Testes unitários de regras e resiliência
e2e/pokedex.spec.js         Fluxos de navegação com Playwright
.github/workflows/         Verificação automática
```

## Qualidade

Testes unitários cobrem busca por nome/número, interseção de filtros, ordenação, conversão de medidas, armazenamento indisponível, deduplicação e recuperação de requisições. GitHub Actions executa análise de sintaxe, testes unitários e testes de navegador em pushes e pull requests. Os testes Playwright usam respostas controladas da API e cobrem paginação, persistência de favoritos, comparação, ficha, filtro por tipo e ausência de transbordamento horizontal em celular.

Para executar os testes de navegador:

```bash
npm ci
npx playwright install chromium
npm run test:e2e
```

As verificações não equivalem a certificação de acessibilidade ou métricas de Lighthouse. A aplicação depende da disponibilidade da PokéAPI, do CDN de sprites e, opcionalmente, de Google Fonts; fontes de sistema são usadas como alternativa.

## Publicação estática

Compatível com GitHub Pages e Vercel sem compilação. No GitHub Pages, selecione a branch e a pasta raiz nas configurações de Pages após integrar a alteração. Na Vercel, use o preset **Other**, sem build e com a raiz do projeto como diretório publicado. Os caminhos relativos permitem hospedagem em subdiretórios.

## Origem e créditos

Este repositório é um fork de [digitalinnovationone/js-developer-pokedex](https://github.com/digitalinnovationone/js-developer-pokedex). A origem educacional e o histórico Git são preservados. A versão 2 redesenha a interface e reorganiza as funcionalidades e a camada de dados.

Dados: [PokéAPI](https://pokeapi.co/docs/v2). Imagens: [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon e suas marcas pertencem aos respectivos titulares, incluindo Nintendo, Creatures e GAME FREAK. Projeto de estudo e portfólio, sem afiliação oficial.
