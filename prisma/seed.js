const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const gifts = [
  { name: 'Deus te iluminou e você resolveu dar uma boa ajuda na nossa lua de mel', price: 3808.97, category: 'honeymoon' },
  { name: 'Cota para falar mal da festa', price: 3121.42, category: 'funny' },
  { name: 'Passagens aéreas para a lua de mel dos noivos (ida e volta)', price: 2212.97, category: 'honeymoon' },
  { name: 'Parada nas Ilhas Maldivas na volta', price: 1716.78, category: 'honeymoon' },
  { name: 'Gravata virtual', price: 1523.36, category: 'wedding' },
  { name: '1 mês de faxina para os noivos descansarem', price: 520.24, category: 'home' },
  { name: '1 mês de almoço garantido em casa', price: 457.81, category: 'home' },
  { name: 'Cortador de unha para cortar a unha do noivo', price: 457.81, category: 'funny' },
  { name: 'Liberdade condicional para o noivo sair com os amigos', price: 416.19, category: 'funny' },
  { name: 'Massagem relaxante para o noivo depois de ver a conta do casamento', price: 381.13, category: 'funny' },
  { name: 'Dia de princesa para a noiva', price: 369.26, category: 'bride' },
  { name: 'Primeiro lugar na fila do buffet', price: 364.17, category: 'funny' },
  { name: '1 mês de academia para os noivos entrarem no shape depois da lua de mel', price: 353.76, category: 'health' },
  { name: '6 meses de barba e cabelo para o noivo', price: 339.92, category: 'groom' },
  { name: 'Extintor de DR', price: 322.55, category: 'funny' },
  { name: 'Terapia preventiva do casal', price: 312.14, category: 'health' },
  { name: 'Máscara de gás para trocar as fraldas do futuro filho', price: 303.30, category: 'funny' },
  { name: 'Camisa do time de coração para a alegria do noivo', price: 274.69, category: 'groom' },
  { name: 'Ajuda para o enxoval do bebê… calma. É brincadeira! (opção 1)', price: 262.10, category: 'funny' },
  { name: 'Ajuda para o enxoval do bebê… calma. É brincadeira! (opção 2)', price: 232.64, category: 'funny' },
  { name: 'Roupa sexy para a noite de núpcias (opção 1)', price: 262.10, category: 'honeymoon' },
  { name: 'Roupa sexy para a noite de núpcias (opção 2)', price: 232.64, category: 'honeymoon' },
  { name: 'Sal pra não perder o tempero do relacionamento', price: 232.13, category: 'funny' },
  { name: 'Oportunidade de ser o amigo/parente favorito dos noivos', price: 229.23, category: 'funny' },
  { name: 'Para ajudar a manter a chama dos noivos acesa', price: 220.89, category: 'funny' },
  { name: 'Ajuda para a aposentadoria dos noivos', price: 208.09, category: 'funny' },
  { name: 'Cura da ressaca para o noivo', price: 208.09, category: 'funny' },
  { name: 'Cobertor para a noiva que tá sempre coberta de razão', price: 197.59, category: 'funny' },
  { name: '1 ano de papel higiênico para o noivo', price: 189.68, category: 'funny' },
  { name: 'Festa de despedida da noiva', price: 186.22, category: 'bride' },
  { name: 'Festa de despedida do noivo', price: 186.22, category: 'groom' },
  { name: 'Cerveja enquanto o noivo espera a noiva voltar das compras', price: 181.98, category: 'funny' },
  { name: 'Happy hour no bar antes do casório', price: 181.98, category: 'funny' },
  { name: 'Kit de primeiros socorros para a noiva', price: 181.98, category: 'funny' },
  { name: 'Jantar romântico para os noivos', price: 177.32, category: 'romantic' },
  { name: 'Pedaço da gravata do noivo', price: 171.68, category: 'wedding' },
  { name: 'Amo vocês, mas gastei toda grana no look', price: 163.56, category: 'funny' },
  { name: 'Curso de culinária para o noivo', price: 162.52, category: 'home' },
  { name: 'Crédito de celular para os noivos ligarem para seus parentes', price: 161.38, category: 'funny' },
  { name: '1 ano de petiscos pra Kiara', price: 156.07, category: 'pets' },
  { name: 'Matricular o Aslan na natação', price: 156.07, category: 'pets' },
  { name: 'Curso de preparação para a chegada do bebê', price: 124.86, category: 'funny' },
  { name: 'Kit paciência para a noiva', price: 104.05, category: 'funny' },
  { name: 'Pra você que tá duro… às vezes o buraco é mais embaixo. A gente entende!', price: 52.13, category: 'funny' }
]

async function main() {
  console.log('Start seeding...')
  let order = 1
  for (const g of gifts) {
    const gift = await prisma.gift.create({
      data: {
        name: g.name,
        price: g.price,
        category: g.category,
        display_order: order++
      }
    })
    console.log(`Created gift with id: ${gift.id}`)
  }
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
