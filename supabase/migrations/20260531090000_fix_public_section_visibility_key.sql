delete from public.public_section_visibility a
using public.public_section_visibility b
where a.ctid < b.ctid
  and a.section_key = b.section_key;

create unique index if not exists public_section_visibility_section_key_key
on public.public_section_visibility(section_key);
