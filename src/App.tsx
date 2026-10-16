
import { useEffect, useState, useRef } from 'react'

export type Task = {
    key: number
    name: string,
    duration: number,
    elapsed: number,
    done: boolean,
}

function App() {

    const [tasks, setTasks] = useState([
        {
            key: 0,
            name: "Shower",
            duration: 600,
            elapsed: 600,
            done: true
        },{
            key: 1,
            name: "Lunch",
            duration: 60,
            elapsed: 45,
            done: false
        },{
            key: 2,
            name: "dishes",
            duration: 15,
            elapsed: 0,
            done: false
        },{
            key: 3,
            name: "brush teeth",
            duration: 5,
            elapsed: 0,
            done: false
        },
    ])
    const [isRunning, setIsRunning] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startTimeRef = useRef(0)
    useEffect(() => {

        function handleAddTask(e: KeyboardEvent){
            const text_input = document.getElementById("new-task-text") as HTMLInputElement | null
            const duration_input = document.getElementById("new-task-duration") as HTMLInputElement | null
            if (e.key === "Enter" && text_input && duration_input && text_input.value !== "") {
                console.log("Enter pressed!")
                setTasks(currentTasks => [...currentTasks, {
                    key: currentTasks.length,
                    name: text_input.value,
                    duration: Number(duration_input.value || 1) * 60,
                    elapsed: 0,
                    done: false
                }])
                duration_input.value = ""
                text_input.value = ""
            }
        }
        addEventListener('keydown', handleAddTask);

        return () => {
            removeEventListener('keydown', handleAddTask)
        }

    }, []);
    useEffect(() => {
        if(isRunning){
            intervalIdRef.current = setInterval(() => {
                setElapsedTime(Date.now() - startTimeRef.current)
            }, 1000)
        }
        return () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
            }
        }
    }, [isRunning])


    function clickCheckbox (key: number) {
        let tempTasks = [...tasks]
        tempTasks[key].done = !tempTasks[key].done
        if (tempTasks[key].done) {
            let tasks_before = tasks.filter((_, i) =>  i < key)
            let durations_tasks_before = tasks_before.map((task, _) => Number(task.duration))
            let taskStartTime = durations_tasks_before.reduce((sum, value) => Number(sum + value), Number(0))
            let elapsed_seconds = Math.floor(elapsedTime / 1000)
            let taskElapsedTime = elapsed_seconds - (taskStartTime * 60)
            tempTasks[key].elapsed = taskElapsedTime
        }
        console.log(tempTasks)
        setTasks(tempTasks)
    }

    function handleRemoveTask(index: number) {
        let tempTasks = tasks.filter((_, i) => i !== index)
        console.log(tempTasks)
        setTasks(tempTasks)        
    }

    function handleTaskNameChange(event: React.ChangeEvent<HTMLInputElement>, index: number){
        let newTasks = [...tasks]
        newTasks[index] = {
            key: index,
            name: event.target.name === "name" ? event.target.value : tasks[index].name,
            duration: event.target.name === "duration" ? Number(event.target.value) : tasks[index].duration,
            elapsed: tasks[index].elapsed,
            done: tasks[index].done,
        }
        setTasks(newTasks)
    }

    function formatTime(){
        let hours = Math.floor(elapsedTime / (3600 * 1000))
        let minutes = Math.floor((elapsedTime / (60 * 1000)) % 60)
        let seconds = Math.floor((elapsedTime / 1000) % 60)
        let seconds_str = String(seconds).padStart(2, "0")
        let minutes_str = String(minutes).padStart(2, "0")

        return `${hours}:${minutes_str}:${seconds_str}`; 
    }

    function toggleTimer(){
        if (!isRunning) {
            startTimeRef.current = Date.now()
        }
        setIsRunning(!isRunning)
    }
    function resetTimer(){
        setElapsedTime(0)
        startTimeRef.current = Date.now() // this is here in hcase it is clicked while running

    }

    const listItems = tasks.map((task, index) => {
        // const [colors, taskElapsedTime] = getTaskColors(tasks, index)
        let colors = ""
        let tasks_before = tasks.filter((_, i) =>  i < index)
        let durations_tasks_before = tasks_before.map((task, _) => Number(task.duration))
        let taskStartTime = durations_tasks_before.reduce((sum, value) => Number(sum + value), Number(0))
        let taskEndTime = taskStartTime + task.duration
        let elapsed_minutes = Math.floor(elapsedTime / (60 * 1000))
        let elapsed_seconds = Math.floor(elapsedTime  /1000 % 60)
        let taskElapsedTime = elapsed_minutes - taskStartTime
        let display_elapsed_minutes = taskElapsedTime < 10 ? "0" + taskElapsedTime : taskElapsedTime
        let display_elapsed_seconds = elapsed_seconds < 10 ? "0" + elapsed_seconds : elapsed_seconds
        if (elapsed_minutes > taskEndTime) {
            colors = 'bg-red-600 hover:bg-red-800'
        } else if (taskStartTime <= elapsed_minutes && elapsed_minutes <= taskEndTime) {
            colors = 'bg-yellow-600 hover:bg-yellow-800'
        } else if (taskStartTime >= elapsed_minutes) {
            colors = 'bg-sky-600 hover:bg-sky-800'
            display_elapsed_minutes = "00"
            display_elapsed_seconds = "00"
            
        }
        if (task.done) {
            colors = 'bg-green-600 hover:bg-green-800'
            elapsed_minutes = Math.floor(task.elapsed / 60)
            elapsed_seconds = Math.floor(task.elapsed % 60)
            display_elapsed_minutes = elapsed_minutes < 10 ? "0" + elapsed_minutes : elapsed_minutes
            display_elapsed_seconds = elapsed_seconds < 10 ? "0" + elapsed_seconds : elapsed_seconds
        }
        let styleClasses = `flex justify-start rounded-md px-2 my-3 ${colors} text-white w-full h-v100`
        let display_duration = Math.floor(task.duration/60)
        return (
            <li key={index} className='flex gap-3 justify-between items-center' >
                <span className={styleClasses}>

                    <span>
                        <input className="mr-1 checked:accent-green-600 cursor-pointer" type="checkbox" checked={task.done} onChange={() => clickCheckbox(index)}/>
                        <input name="name" value={task.name} onChange={(event) => handleTaskNameChange(event, index)}/>
                    </span>
                    <span className='text-right'>{display_elapsed_minutes}:{display_elapsed_seconds}/</span><input className="appearance-none w-10 text-left " type="number" name="duration" value={display_duration < 10 ? "0" + display_duration : display_duration} onChange={(event) => handleTaskNameChange(event, index)}/>
                </span>
                <button className="px-2 bg-red-500 rounded-md text-white" onClick={() => handleRemoveTask(index)}>delete</button>
            </li>
        )
    }
            
            
        );

    return (
    <div className="@container mx-auto text-center">
        <h2 className="text-3xl font-bold underline">Stop List</h2>
        <div className="stoplist-container inline-block">
            <div className="stoplist-header flex justify-between my-6">
                <button onClick={toggleTimer}>{isRunning ? "Stop timer" : "Start timer"}</button>
                <button onClick={resetTimer}>Reset timer</button>
                {formatTime()}
            </div>
            <div className="stoplist-body grid content-center">
                <ul className='inline-block'>
                    {listItems}
                </ul>
            </div>
            <div className="stoplist-footer my-6">
                <input className="pl-5" id="new-task-text" placeholder="Task name"/><input id="new-task-duration" type="number" placeholder="time"/>
            </div>
        </div>
    </div>
    )
}

export default App