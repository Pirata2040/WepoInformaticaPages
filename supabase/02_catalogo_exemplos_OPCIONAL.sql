-- OPCIONAL: preenche catálogo com 6 produtos e 6 serviços EXEMPLOS.
-- Não são estoque, preços ou serviços comerciais confirmados da empresa.
-- Pode ser executado de novo sem duplicar nomes idênticos.
insert into public.catalog_items (kind,title,description,category,image_url,sort_order,active)
select d.kind,d.title,d.description,d.category,d.image_url,d.sort_order,true
from (values
 ('produto','Mouse sem fio','Conforto e praticidade para seu computador.','Periféricos','assets/img/mouse.svg',10),
 ('produto','Teclado USB','Opção de teclado para trabalho, estudo e uso diário.','Periféricos','assets/img/teclado.svg',20),
 ('produto','SSD SATA 480 GB','Uma opção para consultar upgrade de armazenamento.','Componentes','assets/img/ssd.svg',30),
 ('produto','Headset com microfone','Para reuniões, estudos e comunicação no computador.','Periféricos','assets/img/headset.svg',40),
 ('produto','Monitor Full HD','Consulte opções de monitores para seu espaço.','Equipamentos','assets/img/monitor.svg',50),
 ('produto','Roteador Wi-Fi','Soluções de rede e conexão para casa ou trabalho.','Redes','assets/img/roteador.svg',60),
 ('servico','Diagnóstico de computador','Informe o problema e solicite orientação sobre avaliação de computador ou notebook.','Diagnóstico',null,10),
 ('servico','Manutenção de notebook ou PC','Peça uma análise para manutenção ou reparo do equipamento.','Manutenção',null,20),
 ('servico','Limpeza preventiva','Consulte disponibilidade de limpeza e cuidados preventivos.','Manutenção',null,30),
 ('servico','Instalação de SSD ou memória','Solicite informações sobre atualização de armazenamento ou memória.','Upgrade',null,40),
 ('servico','Configuração de programas','Consulte atendimento para instalação e configuração de softwares licenciados.','Software',null,50),
 ('servico','Configuração de rede Wi-Fi','Descreva a necessidade de conectividade e peça um orçamento.','Redes',null,60)
) as d(kind,title,description,category,image_url,sort_order)
where not exists (select 1 from public.catalog_items x where x.kind=d.kind and x.title=d.title);
