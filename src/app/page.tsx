import { Hero } from "@/components/Hero";
import { EventInfo } from "@/components/EventInfo";
import { GiftList } from "@/components/GiftList";
import { FinalMessage } from "@/components/FinalMessage";

export const revalidate = 60;

export default async function Home() {
  // MOCK DATA — Todos os 44 presentes do PRD
  const gifts = [
{ id: 1, name: 'Deus te iluminou e você resolveu dar uma boa ajuda na nossa lua de mel', price: 3808.97, category: 'honeymoon', active: true, display_order: 1, image_url: null, description: null, created_at: new Date() },
    { id: 2, name: 'Cota para falar mal da festa', price: 3121.42, category: 'funny', active: true, display_order: 2, image_url: null, description: null, created_at: new Date() },
    { id: 3, name: 'Passagens aéreas para a lua de mel dos noivos (ida e volta)', price: 2212.97, category: 'honeymoon', active: true, display_order: 3, image_url: null, description: null, created_at: new Date() },
    { id: 4, name: 'Parada nas Ilhas Maldivas na volta', price: 1716.78, category: 'honeymoon', active: true, display_order: 4, image_url: null, description: null, created_at: new Date() },
    { id: 5, name: 'Gravata virtual', price: 1523.36, category: 'wedding', active: true, display_order: 5, image_url: null, description: null, created_at: new Date() },
    { id: 6, name: '1 mês de faxina para os noivos descansarem', price: 520.24, category: 'home', active: true, display_order: 6, image_url: null, description: null, created_at: new Date() },
    { id: 7, name: '1 mês de almoço garantido em casa', price: 457.81, category: 'home', active: true, display_order: 7, image_url: null, description: null, created_at: new Date() },
    { id: 8, name: 'Cortador de unha para cortar a unha do noivo', price: 457.81, category: 'funny', active: true, display_order: 8, image_url: null, description: null, created_at: new Date() },
    { id: 9, name: 'Liberdade condicional para o noivo sair com os amigos', price: 416.19, category: 'funny', active: true, display_order: 9, image_url: null, description: null, created_at: new Date() },
    { id: 10, name: 'Massagem relaxante para o noivo depois de ver a conta do casamento', price: 381.13, category: 'funny', active: true, display_order: 10, image_url: null, description: null, created_at: new Date() },
    { id: 11, name: 'Dia de princesa para a noiva', price: 369.26, category: 'bride', active: true, display_order: 11, image_url: null, description: null, created_at: new Date() },
    { id: 12, name: 'Primeiro lugar na fila do buffet', price: 364.17, category: 'funny', active: true, display_order: 12, image_url: null, description: null, created_at: new Date() },
    { id: 13, name: '1 mês de academia para os noivos entrarem no shape depois da lua de mel', price: 353.76, category: 'health', active: true, display_order: 13, image_url: null, description: null, created_at: new Date() },
    { id: 14, name: '6 meses de barba e cabelo para o noivo', price: 339.92, category: 'groom', active: true, display_order: 14, image_url: null, description: null, created_at: new Date() },
    { id: 15, name: 'Extintor de DR', price: 322.55, category: 'funny', active: true, display_order: 15, image_url: null, description: null, created_at: new Date() },
    { id: 16, name: 'Terapia preventiva do casal', price: 312.14, category: 'health', active: true, display_order: 16, image_url: null, description: null, created_at: new Date() },
    { id: 17, name: 'Máscara de gás para trocar as fraldas do futuro filho', price: 303.30, category: 'funny', active: true, display_order: 17, image_url: null, description: null, created_at: new Date() },
    { id: 18, name: 'Camisa do time de coração para a alegria do noivo', price: 274.69, category: 'groom', active: true, display_order: 18, image_url: null, description: null, created_at: new Date() },
    { id: 19, name: 'Ajuda para o enxoval do bebê… calma. É brincadeira! (opção 1)', price: 262.10, category: 'funny', active: true, display_order: 19, image_url: null, description: null, created_at: new Date() },
    { id: 20, name: 'Ajuda para o enxoval do bebê… calma. É brincadeira! (opção 2)', price: 232.64, category: 'funny', active: true, display_order: 20, image_url: null, description: null, created_at: new Date() },
    { id: 21, name: 'Roupa sexy para a noite de núpcias (opção 1)', price: 262.10, category: 'honeymoon', active: true, display_order: 21, image_url: null, description: null, created_at: new Date() },
    { id: 22, name: 'Roupa sexy para a noite de núpcias (opção 2)', price: 232.64, category: 'honeymoon', active: true, display_order: 22, image_url: null, description: null, created_at: new Date() },
    { id: 23, name: 'Sal pra não perder o tempero do relacionamento', price: 232.13, category: 'funny', active: true, display_order: 23, image_url: null, description: null, created_at: new Date() },
    { id: 24, name: 'Oportunidade de ser o amigo/parente favorito dos noivos', price: 229.23, category: 'funny', active: true, display_order: 24, image_url: null, description: null, created_at: new Date() },
    { id: 25, name: 'Para ajudar a manter a chama dos noivos acesa', price: 220.89, category: 'funny', active: true, display_order: 25, image_url: null, description: null, created_at: new Date() },
    { id: 26, name: 'Ajuda para a aposentadoria dos noivos', price: 208.09, category: 'funny', active: true, display_order: 26, image_url: null, description: null, created_at: new Date() },
    { id: 27, name: 'Cura da ressaca para o noivo', price: 208.09, category: 'funny', active: true, display_order: 27, image_url: null, description: null, created_at: new Date() },
    { id: 28, name: 'Cobertor para a noiva que tá sempre coberta de razão', price: 197.59, category: 'funny', active: true, display_order: 28, image_url: null, description: null, created_at: new Date() },
    { id: 29, name: '1 ano de papel higiênico para o noivo', price: 189.68, category: 'funny', active: true, display_order: 29, image_url: null, description: null, created_at: new Date() },
    { id: 30, name: 'Festa de despedida da noiva', price: 186.22, category: 'bride', active: true, display_order: 30, image_url: null, description: null, created_at: new Date() },
    { id: 31, name: 'Festa de despedida do noivo', price: 186.22, category: 'groom', active: true, display_order: 31, image_url: null, description: null, created_at: new Date() },
    { id: 32, name: 'Cerveja enquanto o noivo espera a noiva voltar das compras', price: 181.98, category: 'funny', active: true, display_order: 32, image_url: null, description: null, created_at: new Date() },
    { id: 33, name: 'Happy hour no bar antes do casório', price: 181.98, category: 'funny', active: true, display_order: 33, image_url: null, description: null, created_at: new Date() },
    { id: 34, name: 'Kit de primeiros socorros para a noiva', price: 181.98, category: 'funny', active: true, display_order: 34, image_url: null, description: null, created_at: new Date() },
    { id: 35, name: 'Jantar romântico para os noivos', price: 177.32, category: 'romantic', active: true, display_order: 35, image_url: null, description: null, created_at: new Date() },
    { id: 36, name: 'Pedaço da gravata do noivo', price: 171.68, category: 'wedding', active: true, display_order: 36, image_url: null, description: null, created_at: new Date() },
    { id: 37, name: 'Amo vocês, mas gastei toda grana no look', price: 163.56, category: 'funny', active: true, display_order: 37, image_url: null, description: null, created_at: new Date() },
    { id: 38, name: 'Curso de culinária para o noivo', price: 162.52, category: 'home', active: true, display_order: 38, image_url: null, description: null, created_at: new Date() },
    { id: 39, name: 'Crédito de celular para os noivos ligarem para seus parentes', price: 161.38, category: 'funny', active: true, display_order: 39, image_url: null, description: null, created_at: new Date() },
    { id: 40, name: '1 ano de petiscos pra Kiara', price: 156.07, category: 'pets', active: true, display_order: 40, image_url: null, description: null, created_at: new Date() },
    { id: 41, name: 'Matricular o Aslan na natação', price: 156.07, category: 'pets', active: true, display_order: 41, image_url: null, description: null, created_at: new Date() },
    { id: 42, name: 'Curso de preparação para a chegada do bebê', price: 124.86, category: 'funny', active: true, display_order: 42, image_url: null, description: null, created_at: new Date() },
    { id: 43, name: 'Kit paciência para a noiva', price: 104.05, category: 'funny', active: true, display_order: 43, image_url: null, description: null, created_at: new Date() },
    { id: 44, name: 'Pra você que tá duro… às vezes o buraco é mais embaixo. A gente entende!', price: 52.13, category: 'funny', active: true, display_order: 44, image_url: null, description: null, created_at: new Date() },
  ] as any;

  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <EventInfo />
      <GiftList gifts={gifts} />
      <FinalMessage />
    </main>
  );
}
