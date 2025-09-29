<template>
    <q-layout>
        <q-page-container>
            <q-page>
                <div class="row q-ma-xl q-col-gutter-md">
                    <q-form @submit="onSubmit" @reset="onReset" class="row col-12 q-col-gutter-xs">
                        <div class='col-3'>
                            <q-input outlined v-model.trim="form.nome" dense label="Nome" :disable="action==='editar'"/>
                        </div>
                        <div class='col-2'>
                            <q-input outlined v-model.trim="form.cpf" dense label="Cpf" :disable="action==='editar'"
                            :rules="[
                                val => !!val || 'CPF é obrigatório',
                                val => /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(val) || 'CPF inválido'
                            ]" />
                        </div>
                        <div class='col-2'>
                            <q-input outlined v-model.trim="form.email" dense label="Email" />
                        </div>
                        <div class='col-2'>
                            <q-input outlined v-model.trim="form.telefone" dense label="Telefone"
                            mask='(##)#####-####'/>
                        </div>
                        <div class='col-3'>
                            <q-select outlined dense v-model="form.mensalidade" :options="options" label="Mensalidade" @filter='filterFn'
                            emit-value map-options option-value="id" option-label="descricao" use-chips use-input/>
                        </div>
                        <div class="col-12 q-mt-sm">
                        <q-btn unelevated rounded color="primary" label="Cadastrar" type='submit'
                        v-if="action==='cadastrar'"/>
                        <q-btn unelevated rounded color="primary" label="Editar" type='submit' v-else/>
                    </div>
                    </q-form>
                    
                    
                    <div class="col-12">
                    <q-table
                        title="Usuários"
                        :rows="rows"
                        :columns="columns"
                        row-key="index"
                        virtual-scroll
                        v-model:pagination="pagination"
                        @request="getData"
                    >
                        <template v-slot:body="props">
                            <q-tr :props="props">
                                <q-td key="nome" :props="props">
                                {{ props.row.nome }}
                                </q-td>
                                <q-td key="cpf" :props="props">
                                {{ props.row.cpf }}
                                </q-td>
                                <q-td key="telefone" :props="props">
                                {{ props.row.telefone }}
                                </q-td>
                                <q-td key="email" :props="props">
                                {{ props.row.email }}
                                </q-td>
                                <q-td key="mensalidade" :props="props">
                                {{ props.row.mensalidade ? props.row.mensalidade.descricao : null }}
                                </q-td>
                                
                                <q-td key="edicao" :props="props">
                                    <q-btn outline round color="primary" icon="edit"
                                    @click='editData(props.row)'/>
                                </q-td>
                                <q-td key="exclusao" :props="props">
                                    <q-btn outline round color="primary" :icon="props.row.deletedAt ? 'check' : 'close'"
                                    @click='deleteData(props.row.id)'/>
                                </q-td>
                            </q-tr>
                        </template>

                        <template v-slot:top-right>
                            <q-input outline dense debounce="300" v-model="filter" placeholder="Search" @keyup.enter="getData">
                            <template v-slot:append>
                                <q-icon name="search" />
                            </template>
                            </q-input>

                            <q-checkbox
                                v-model="inativos"
                                label="Exibir inativos"
                                @update:model-value="getData"
                            />
                        </template>
                    </q-table>
                    </div>
                </div>           
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
    import {api} from 'boot/axios'
    import { ref, onMounted } from 'vue'
    //import {Notify} from 'quasar'

    type QTableRequestProps = {
        pagination: {
            sortBy: string
            descending: boolean
            page: number
            rowsPerPage: number
            rowsNumber?: number
            }
    filter?: undefined
    getCellValue: (col: undefined, row: undefined) => undefined
    }
    
    const action = ref('cadastrar')
    const filter= ref('')
    const inativos = ref(false)
    
    const columns = [
        { name: 'nome', label: 'Nome', sortable: true, field: 'nome'},
        { name: 'cpf', label: 'Cpf', field: 'cpf', sortable: true },
        { name: 'telefone', label: 'Telefone', field: 'telefone', sortable: true },
        { name: 'email', label: 'Email', field: 'email' },
        { name: 'mensalidade', label: 'Mensalidade', field: 'mensalidade' },
        { name: 'edicao', label: '', field: 'edicao'},
        { name: 'exclusao', label: '', field: 'exclusao'}

    ]
    const rows = ref([
    ])

    const pagination = ref({
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
     })

    function onReset() {
        form.value.nome = ''
        form.value.email = ''
        form.value.cpf = ''
        form.value.telefone = ''
        form.value.id = 0
        form.value.mensalidade = null
    }

    async function onSubmit() {    
        if(validate()){
            if (action.value==='cadastrar') {
                try {
                const res = await api.post('/usuarios', form.value)
                if(res && res.status===201){
                    //Notify.create({ type: 'positive', message: 'Usuário criado!' })
                    console.log('deu certo')
                    await getData({ 
                        pagination: pagination.value,
                        filter: undefined,
                        getCellValue: () => undefined
                    })
                }
                } catch (error) {
                    //Notify.create({ type: 'negative', message: 'Erro ao criar usuário' })
                    console.error(error)
                }
            } else {
               try {
                const res = await api.put(`/usuarios/${form.value.id}`, form.value)
                if(res && res.status===204){
                    //Notify.create({ type: 'positive', message: 'Usuário criado!' })
                    console.log('deu certo')
                    onReset()
                    action.value = 'cadastrar'
                    await getData({ 
                        pagination: pagination.value,
                        filter: undefined,
                        getCellValue: () => undefined
                    })
                    
                }
            } catch (error) {
                //Notify.create({ type: 'negative', message: 'Erro ao criar usuário' })
                console.error(error)
            } 
            }
            
        }

    }

    function validate() {
        if (!form.value.nome || !form.value.cpf || !form.value.email || !form.value.telefone) {
            // Notify.create({
            //     type: 'negative',
            //     message: 'Todos os campos são obrigatórios'
            // })
            return false
        }
        return true
    }

    onMounted(async() => {
        await getData({ 
            pagination: pagination.value,
            filter: undefined,
            getCellValue: () => undefined
        })
    })

    async function getData(props: QTableRequestProps) {
        try{
            if(props.pagination){
                const { page, rowsPerPage, sortBy, descending } = props.pagination

                pagination.value.page = page ?? 1
                pagination.value.rowsPerPage = rowsPerPage ?? 10
                pagination.value.sortBy = sortBy ?? 'desc'
                pagination.value.descending = descending ?? 'id'
            }

            const res = await api.get('/usuarios', {params: {pagination: pagination.value, filter: filter.value, inativos: inativos.value}})
            if(res && res.status === 200){
                rows.value = res.data.data
                pagination.value.rowsNumber = res.data.meta.total
            }
        } catch(error){
            console.error(error)
        }
    }

    async function deleteData(id: number){
        try{
            const res = await api.delete(`/usuarios/${id}`)
            if(res && res.status === 204){
                await getData({ 
                        pagination: pagination.value,
                        filter: undefined,
                        getCellValue: () => undefined
                    })
            }
        } catch(error){
            console.error(error)
        }
    }

    function editData(data: {telefone: string, email: string, nome: string, cpf: string, id: number, mensalidade: {id: number, descricao: string}}) {
        form.value.telefone = data.telefone
        form.value.email = data.email
        form.value.nome = data.nome
        form.value.cpf = data.cpf
        form.value.id = data.id
        form.value.mensalidade = data.mensalidade
        action.value = 'editar'
        
    }


    interface formProps{
        id: number,
        nome: string,
        cpf: string,
        email: string,
        telefone: string,
        mensalidade: {id: number, descricao: string} | null
    }

    const form = ref<formProps>({
        id: 0,
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        mensalidade: null
    })

    const options = ref([])

    function filterFn(
        val: string,
        update: (fn: () => void, after?: () => void) => void
        ) {
        update(() => {
        api.get('/mensalidades/list', { params: { filter: val } })
            .then((res) => {
            if (res.status === 200) {
                options.value = res.data
            }
            })
            .catch((err) => console.error(err))
        })
    }

</script>