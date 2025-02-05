<template>
  <div >
    <!-- 添加的漂亮标题 -->
    <div class="maindiv">
      <div class="title-container">
        <h1 class="title">线上即兴游戏工具</h1>
        <h1 class="info-icon" @click="showInstructions">ⓘ</h1>
      </div>
      <!-- 弹窗显示注意事项 -->
       

      <h2 class="catalog">游戏模式</h2>
      <button @click="toggleGameMode" class="mode-btn">
        {{ gameMode ? '退出上帝之手模式' : '上帝之手' }}
      </button>
      <h2 class="catalog">辅助工具</h2>
      <button @click="showUploadDialog" class="upload-btn">
        导入腾讯会议名单
      </button>
       <!-- 添加上传弹窗 -->
      <div v-if="showDialog" class="dialog-overlay">
        <div class="dialog-content">
          <h3>导入会议成员名单</h3>
          <input 
            type="file" 
            @change="handleFileUpload" 
            accept=".xlsx,.xls"
            class="file-input"
          >
          <div class="help-link">
            <a href="#" @click.prevent="showHelp">如何导出腾讯会议成员名单？</a>
          </div>
          <img 
            v-if="showHelpImage" 
            src="./assets/腾讯会议如何导出会议成员.png" 
            class="help-image"
          >
          <button @click="closeDialog" class="close-btn">关闭</button>
        </div>
      </div>
      
    </div>
  </div>
  
  <div  class="maindiv">
    <div v-if="!gameMode" class="input-group">
      <div class="input-container">
        <input 
          v-model="newName" 
          @keyup.enter="addPerson" 
          @input="handleInput"
          placeholder="输入姓名"
        >
        <!-- 添加搜索结果下拉框 -->
        <div v-if="searchResults.length && newName" class="search-dropdown">
          <div 
            v-for="name in searchResults" 
            :key="name"
            class="search-item"
            @click="selectSearchResult(name)"
          >
            {{ name }}
          </div>
        </div>
      </div>
      <select v-model="selectedCommonName" @change="handleCommonNameSelect" class="common-names" size="1">
        <option value="">选择常用名字</option>
        <option v-for="name in commonNames" :key="name" :value="name">
          {{ name }}
        </option>
      </select>
      <button @click="addPerson">添加</button>
  </div>

      <div>
    <button @click="randomSelectPerson" class="random-btn" :disabled="visiblePeople.length === 0">
      随机选择
    </button>
        <button
            @click="moveHighlight"
            class="move-btn"
            :disabled="visiblePeople.length === 0"
        >
          按顺序移动
        </button>        </div>


    <draggable
        v-model="visiblePeople"
        @end="onDragEnd"
        item-key="id"
        class="people-list"
    >
      <template #item="{ element, index }">
        <div
            :class="['person-item', { 'highlight': index === currentIndex }]"
            @click="selectPerson(index)"
        >
          <span class="checkmark">✓</span>
          <span class="name">{{ element.name }}</span>
          <button
              @click.stop="handleAction(index)"
              :class="['action-btn', { 'eliminate-btn': gameMode }]"
          >
            {{ gameMode ? '淘汰' : '删除' }}
          </button>
        </div>
      </template>
    </draggable>



    <div v-if="gameMode && eliminatedPeople.length" class="eliminated-list">
      <h3>已淘汰名单</h3>
      <div v-for="person in eliminatedPeople" :key="person.id" class="eliminated-item"@click="restorePerson(person)">
        {{ person.name }}
      </div>
    </div>
  </div>

  <div v-if="showMessage" :class="['message-popup', messageType]">
    {{ message }}
  </div>

  <!-- 使用说明弹窗 -->
  <div v-if="showInstructionsDialog" class="dialog-overlay">
    <div class="dialog-content instructions-dialog">
      <h3>使用说明</h3>
      <div class="instructions-text" v-html="instructions"></div>
      <button @click="closeInstructions" class="close-btn">关闭</button>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import * as XLSX from 'xlsx'  // 需要安装 xlsx 包
import { ref } from 'vue'
import { marked } from 'marked'
import instructionsText from '@/assets/instructions.md?raw'

export default {
  components: { draggable },
  data() {
    return {
      newName: '',
      people: [],
      currentIndex: 0,
      gameMode: false,
      nextId: 1,
      randomButtonEnabled: true, // 新增控制随机按钮状态的属性
      selectedCommonName: '',
      commonNames: ['John', 'Jane', 'Doe', 'Smith', 'Bob', 'Alice','Tom','Jerry','Mike'],
      commonNameSelect: false,
      showDialog: false,
      showHelpImage: false,
      showMessage: false,
      message: '',
      messageType: 'success',  // 新增消息类型
      searchResults: [],
      showInstructionsDialog: false,
      instructions: marked(instructionsText), // 使用 marked 解析 markdown
    }
  },
  computed: {
    visiblePeople: {
      get() {
        return this.gameMode
            ? this.people.filter(p => !p.eliminated)
            : this.people
      },
      set(value) {
        if (this.gameMode) {
          const eliminated = this.people.filter(p => p.eliminated)
          this.people = [...value, ...eliminated]
        } else {
          this.people = value
        }
      }
    },
    eliminatedPeople() {
      return this.people.filter(p => p.eliminated)
    }
  },
  methods: {
    addPerson() {
      if (this.newName.trim()) {
        this.people.push({
          id: this.nextId++,
          name: this.newName.trim(),
          eliminated: false
        })
        this.newName = ''
        this.searchResults = [] // 清空搜索结果
      }
    },
    handleAction(index) {
      if (index < 0 || index >= this.visiblePeople.length) return; // 添加边界检查
      this.gameMode ? this.eliminatePerson(index) : this.removePerson(index)
    },
    removePerson(index) {
      this.people.splice(index, 1)
      this.adjustCurrentIndex()
    },
    eliminatePerson(index) {
      this.visiblePeople[index].eliminated = true
      this.adjustCurrentIndex()
    },
    moveHighlight() {
      if (this.visiblePeople.length === 0) return
      this.currentIndex = (this.currentIndex + 1) % this.visiblePeople.length
    },
    selectPerson(index) {
      this.currentIndex = index
    },
    toggleGameMode() {
      this.gameMode = !this.gameMode
      this.currentIndex = 0
    },
    adjustCurrentIndex() {
      const length = this.visiblePeople.length;
      if (length === 0) {
        this.currentIndex = -1; // 当没有人时设为-1还是0？
      } else{
        this.currentIndex = Math.min(this.currentIndex, this.visiblePeople.length - 1)
      } // 确保不会超出数组范围

    },
    onDragEnd() {
      // 自动保持当前选中项的视觉位置
    },
    randomSelectPerson() {
      if (this.visiblePeople.length > 1) {
        const currentLength = this.visiblePeople.length;
        let randomIndex = Math.floor(Math.random() * currentLength)
        let attempts = 0;
        do {
          randomIndex = Math.floor(Math.random() * currentLength);
          attempts++;
        } while (randomIndex === this.currentIndex && attempts < 10);
    
        this.currentIndex = randomIndex
      }
    },
    handleCommonNameSelect() {
      if (this.selectedCommonName) {
        this.newName = this.selectedCommonName
        this.addPerson()
      }
    },
    restorePerson(person) {
      person.eliminated = false
      this.adjustCurrentIndex()
    },
    toggleCommonNameSelect() {
      this.commonNameSelect = !this.commonNameSelect
    },
    showUploadDialog() {
      this.showDialog = true
      this.showHelpImage = false
    },
    
    closeDialog() {
      this.showDialog = false
      this.showHelpImage = false
    },
    
    showHelp() {
      this.showHelpImage = !this.showHelpImage
    },
    
    showTempMessage(message, type = 'success') {
      this.message = message
      this.messageType = type  // 用于控制不同类型消息的样式
      this.showMessage = true
      setTimeout(() => {
        this.showMessage = false
      }, 3000)
    },
    
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        const data = await this.readExcelFile(file)
        if (data && data.length > 9) {
          const headers = [
            '会议主题:',
            '会议号:',
            '会议创建者:',
            '预定开始时间:',
            '预定结束时间:',
            '累计会议时长:',
            '参会用户总数:',
            '',  // 空行
            '用户昵称（入会昵称）'
          ]
          
          const isValidFormat = headers.every((header, index) => {
            const cellValue = data[index][0] || ''
            return cellValue.trim() === header
          })
          
          if (!isValidFormat) {
            this.showTempMessage('文件格式不正确，请确保是腾讯会议导出的名单', 'error')
            return
          }
          
          const totalUsers = parseInt(data[6][1])
          const names = []
          for (let i = 9; i < data.length && names.length < 200; i++) {  // 限制最多200条
            const fullName = data[i][0]
            if (!fullName) break
            
            const match = fullName.match(/（(.*?)）|【(.*?)】|\((.*?)\)/)
            const name = match ? (match[1] || match[2] || match[3]) : fullName
            names.push(name)
          }
          
          this.commonNames = names
          this.closeDialog()
          
          // 修改提示消息，当超过200人时显示提示
          const message = names.length === 200 && data.length > 209 
            ? `已导入200条数据（已达上限）${totalUsers ? `，会议系统显示共 ${totalUsers} 人` : ''}`
            : `成功导入 ${names.length} 条数据${totalUsers ? `（会议系统显示共 ${totalUsers} 人）` : ''}`
          
          this.showTempMessage(message)
        } else {
          this.showTempMessage('文件内容不完整', 'error')
        }
      } catch (error) {
        this.showTempMessage('文件读取失败，请确保文件格式正确', 'error')
      }
    },
    readExcelFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
            resolve(jsonData)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })
    },
    handleInput() {
      if (!this.newName) {
        this.searchResults = []
        return
      }
      
      // 执行模糊搜索
      this.searchResults = this.commonNames.filter(name => 
        name.toLowerCase().includes(this.newName.toLowerCase())
      ).slice(0, 5) // 最多显示5个结果？
    },
    
    selectSearchResult(name) {
      this.newName = name
      this.searchResults = []
      this.addPerson()
    },
    showInstructions() {
      this.showInstructionsDialog = true
    },
    
    closeInstructions() {
      this.showInstructionsDialog = false
    },
  }
}
</script>

<style>
.maindiv{
  margin-top: 20px;
  margin-right: 30px;
  margin-bottom: 40px;
  margin-left: 30px;
}
.title {
  text-align: center;
  font-size: 2.5em;
  color: #4CAF50; /* 绿色文本，可以根据需要调整 */
  margin-bottom: 20px;
  /*border-bottom: 2px solid #ddd; /* 底部边框装饰 */
  padding-bottom: 0px;
}
.catalog{
  text-align: left;
  font-size: 1.5em;
  color: #4CAF50; /* 绿色文本，可以根据需要调整 */
  margin-bottom: 20px;

}

.input-group {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  align-items: flex-start; /* 确保下拉框不会影响其他元素 */
}

.input-container {
  position: relative;
  flex-grow: 1;
}

.input-container input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-btn {
  background: #2196F3;
  color: white;
  margin-bottom: 20px;
}

.move-btn {
  background: #4CAF50;
  color: white;
  margin: 20px 0;
}

.people-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.person-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f8f8;
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;
}

.person-item.highlight {
  background: #fff9c4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.checkmark {
  opacity: 0;
  margin-right: 15px;
  color: #4CAF50;
  font-weight: bold;
}

.highlight .checkmark {
  opacity: 1;
}

.name {
  flex-grow: 1;
}

.action-btn {
  background: #ff4444;
  color: white;
}

.action-btn.eliminate-btn {
  background: #ff8800;
}

.eliminated-list {
  margin-top: 30px;
  padding: 20px;
  background: #fff3e0;
  border-radius: 8px;
}

.eliminated-item {
  padding: 10px;
  color: #666;
  text-decoration: line-through;
  cursor: pointer; /* 添加手型光标 */
  transition: all 0.3s;
}

.eliminated-item:hover {
  background-color: #fff;
  text-decoration: none;
  color: #4CAF50;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 新增按钮样式 */
.random-btn {
  background: #FFC107; /* 橙色背景，可以根据需要调整 */
  color: white;
  margin-bottom: 20px;
}

.common-names {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  min-width: 120px;
  height: 36px; /* 允许下拉列表显示多行 */
  max-height: 150px; /* 限制最大高度 */
  /*overflow-y: auto; /* 添加垂直滚动条 */
  cursor: pointer; /* 添加手型光标 */
  appearance: auto; /* 恢复默认的下拉箭头样式 */
}
.common-names option {
  padding: 6px 8px;
  transition: background-color 0.2s;
}

.common-names option:hover {
  background-color: #f5f5f5;
}

.upload-btn {
  background: #673AB7;
  color: white;
  margin-bottom: 20px;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
  text-align: center;
}

.file-input {
  margin: 20px 0;
}

.help-link {
  margin: 15px 0;
}

.help-link a {
  color: #2196F3;
  text-decoration: none;
}

.help-image {
  max-width: 100%;
  margin-top: 10px;
}

.close-btn {
  background: #666;
  color: white;
  margin-top: 15px;
}

.message-popup {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  animation: fadeInOut 3s ease-in-out;
  color: white;
}

.message-popup.success {
  background-color: #4CAF50;
}

.message-popup.error {
  background-color: #f44336;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -20px); }
  10% { opacity: 1; transform: translate(-50%, 0); }
  90% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-item:hover {
  background-color: #f5f5f5;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 0px;
}

.info-icon {
  font-size: 24px;
  color: #4CAF50;
  cursor: pointer;
  transition: opacity 0.2s;
}

.info-icon:hover {
  opacity: 0.8;
}

.instructions-dialog {
  max-width: 600px;
  width: 90%;
}

.instructions-text {
  text-align: left;
  line-height: 1.6;
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 添加 markdown 样式 */
.instructions-text h2 {
  color: #4CAF50;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-size: 1.3em;
}

.instructions-text ul {
  margin: 1em 0;
  padding-left: 2em;
}

.instructions-text li {
  margin: 0.5em 0;
  line-height: 1.5;
}

.instructions-text li::marker {
  color: #4CAF50;
}
</style>