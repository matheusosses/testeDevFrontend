<template>
    <q-layout>
        <q-page-container>
            <q-page>
                <div class="row q-ma-xl q-col-gutter-md">
                    <q-form @submit="onSubmit" @reset="onReset" class="row col-12 q-col-gutter-xs">
                        <div class='col-3'>
                            <q-input outlined v-model.trim="form.descricao" dense label="Descrição" :disable="action==='editar'"/>
                        </div>
                        <div class='col-2'>
                            <q-input outlined v-model.trim="form.valor" dense label="Valor"/>
                        </div>
                        <div class='col-2'>
                            <q-input outlined dense v-model="form.dataValidade" mask="date" :rules="['date'] ">
                                <template v-slot:append>
                                    <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="form.dataValidade">
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary" flat />
                                        </div>
                                        </q-date>
                                    </q-popup-proxy>
                                    </q-icon>
                                </template>
                            </q-input>
                        </div>
                        <div class="col-12 q-mt-sm">
                        <q-btn unelevated rounded color="primary" label="Cadastrar" type='submit'
                        v-if="action==='cadastrar'"/>
                        <q-btn unelevated rounded color="primary" label="Editar" type='submit' v-else/>
                    </div>
                    </q-form>
                    
                    
                    <div class="col-12">
                    <q-table
                        title="Mensalidades"
                        :rows="rows"
                        :columns="columns"
                        row-key="index"
                        virtual-scroll
                        v-model:pagination="pagination"
                        @request="getData"
                        
                    >
                        <template v-slot:body="props">
                            <q-tr :props="props">
                                <q-td key="descricao" :props="props">
                                {{ props.row.descricao }}
                                </q-td>
                                <q-td key="valor" :props="props">
                                {{ formatValor(props.row.valor) }}
                                </q-td>
                                <q-td key="dataValidade" :props="props">
                                {{ formatData(props.row.dataValidade) }}
                                </q-td>
                                
                                <q-td key="edicao" :props="props">
                                    <q-btn outline round color="primary" icon="edit"
                                    @click='editData(props.row)'/>
                                </q-td>
                                <q-td key="exclusao" :props="props">
                                    <q-btn outline round color="primary" icon="close"
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
    
    const columns = [
        { name: 'descricao', label: 'Descrição', sortable: true, field: 'descricao'},
        { name: 'valor', label: 'Valor', field: 'valor', sortable: true },
        { name: 'dataValidade', label: 'Vencimento', field: 'dataValidade', sortable: true },
        { name: 'edicao', label: '', field: 'edicao'},
        { name: 'exclusao', label: '', field: 'exclusao'}

    ]
    const rows = ref([
    ])

    const filter= ref('')

    const pagination = ref({
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
     })

    function onReset() {
        form.value.descricao = ''
        form.value.valor = 0
        form.value.dataValidade = ''
        form.value.id = 0
    }

    async function onSubmit() {    
        if(validate()){
            if (action.value==='cadastrar') {
                try {
                const res = await api.post('/mensalidades', form.value)
                if(res && res.status===201){
                    console.log('deu certo')
                    await getData({ 
                        pagination: pagination.value,
                        filter: undefined,
                        getCellValue: () => undefined
                    })
                }
                } catch (error) {
                    console.error(error)
                }
            } else {
               try {
                const res = await api.put(`/mensalidades/${form.value.id}`, form.value)
                if(res && res.status===204){
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
                console.error(error)
            } 
            }
            
            
        }

    }

    function validate() {
        if (!form.value.descricao || !form.value.valor || !form.value.dataValidade) {
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

            const res = await api.get('/mensalidades', {params: {pagination: pagination.value, filter: filter.value}})
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
            const res = await api.delete(`/mensalidades/${id}`)
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

    function editData(data: {descricao: string, valor: number, dataValidade: string, id: number,}) {
        form.value.descricao = data.descricao
        form.value.valor = data.valor
        form.value.dataValidade = data.dataValidade
        form.value.id = data.id
        action.value = 'editar'
        
    }


    interface formProps{
        id: number,
        descricao: string,
        valor: number,
        dataValidade: string,
    }

    const form = ref<formProps>({
        id: 0,
        descricao: '',
        valor: 0,
        dataValidade: '',
    })

    function formatValor(valor: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(valor);
    }

    function formatData(data: string):string {
        const dateObject = new Date(data);
        
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC', // IMPORTANTE!
        }).format(dateObject);
    }


</script>